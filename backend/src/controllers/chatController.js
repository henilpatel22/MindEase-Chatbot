/**
 * MindEase — Chat Controller (Gemini AI Powered)
 * Handles messages with face emotion fusion, conversation context,
 * and real AI responses powered by Google Gemini.
 */

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const MoodLog = require('../models/MoodLog');

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:5001';
const getTodayKey = () => new Date().toISOString().split('T')[0];

// ── Gemini AI Setup ───────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const SYSTEM_PROMPT = `You are MindEase, a warm, empathetic, and highly intelligent mental health companion AI. Your role is to support users through their emotional challenges with the wisdom of a seasoned therapist and the warmth of a trusted friend.

Your core principles:
- ALWAYS respond in a deeply human and personalized way. Never give generic, copy-paste answers.
- Read the user's actual message carefully and respond to the SPECIFIC things they said. Reference their exact words.
- Mirror the emotional energy of the user — if they are distressed, be gentler and slower. If they are curious, be engaging and insightful.
- Ask follow-up questions naturally, like a real person who is genuinely curious and listening.
- Use a conversational, natural tone. Avoid sounding robotic, clinical, or scripted.
- Share relevant psychological insights, coping techniques, and grounding exercises when appropriate — but weave them naturally into the conversation, don't just list them.
- Keep responses focused and concise — typically 3-5 sentences for casual messages, longer for deeper emotional support.
- NEVER repeat the same response twice. Every message deserves a unique, thoughtful reply.
- Use relevant emojis sparingly to add warmth, but don't overdo it.
- If the user seems to be in crisis, gently encourage them to reach out to a helpline and use the SOS button on screen.
- You have access to the full conversation history, so maintain continuity and build on what has been discussed.`;

// ── POST /api/chat/message ────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const {
      message,
      conversationId,
      context = [],
      faceEmotion = null,
      faceEmotionScore = null,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const userId = req.user._id;

    // ── 1. Detect text emotion via Python service ─────────────────────────────
    let emotionData = { emotion: 'neutral', score: 0.5, isCrisis: false };
    try {
      const emotionRes = await axios.post(`${AI_SERVICE}/analyze`, { text: message }, { timeout: 8000 });
      emotionData = emotionRes.data;
    } catch {
      console.warn('⚠️  AI emotion service unavailable — using neutral fallback');
    }

    // ── 2. Combine text + face emotion ────────────────────────────────────────
    let finalEmotion = emotionData.emotion;
    let finalScore   = emotionData.score;

    if (faceEmotion && faceEmotionScore != null && faceEmotionScore > 0.3) {
      const faceWeight = faceEmotionScore > 0.85 ? 0.5 : 0.4;
      const textWeight = 1 - faceWeight;
      if (faceEmotion === emotionData.emotion) {
        finalScore = Math.min(0.99, emotionData.score * textWeight + faceEmotionScore * faceWeight);
      } else {
        const textW = emotionData.score * textWeight;
        const faceW = faceEmotionScore * faceWeight;
        if (faceW > textW) { finalEmotion = faceEmotion; finalScore = faceEmotionScore; }
      }
    }

    // ── 3. Generate response with Gemini AI ───────────────────────────────────
    let botResponse = "I'm here for you. Could you tell me a little more about how you're feeling?";

    try {
      // Build chat history from context for Gemini
      const chatHistory = context.flatMap(msg => {
        if (msg.role === 'user') {
          return [{ role: 'user', parts: [{ text: msg.content }] }];
        } else if (msg.role === 'bot' || msg.role === 'model') {
          return [{ role: 'model', parts: [{ text: msg.content }] }];
        }
        return [];
      });

      // Emotion context to include in the prompt
      const emotionContext = `[Context: User emotion detected as "${finalEmotion}" (${Math.round(finalScore * 100)}% confidence).${faceEmotion ? ` Face shows "${faceEmotion}".` : ''}${emotionData.isCrisis ? ' ⚠️ CRISIS KEYWORDS DETECTED — prioritize safety.' : ''}]`;

      const userPromptWithEmotion = `${emotionContext}\n\nUser: ${message}`;

      const chat = geminiModel.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: "Understood. I'm MindEase — a warm, empathetic AI companion ready to listen and support each person uniquely." }] },
          ...chatHistory,
        ],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.85,
          topP: 0.95,
        },
      });

      const result = await chat.sendMessage(userPromptWithEmotion);
      botResponse = result.response.text().trim();
    } catch (geminiErr) {
      console.error('Gemini error:', geminiErr.message);
      // Graceful emotion-aware fallback
      const fallbacks = {
        sad: "I hear you, and I'm really glad you're talking to me. 💙 Whatever you're going through, you don't have to face it alone. Can you tell me more about what's been weighing on you?",
        anxious: "That anxious feeling sounds really tough. 💜 Take a slow breath with me — in for 4 counts, out for 6. You're safe right now. What's been triggering this for you?",
        angry: "I can feel the frustration in your words, and it's completely valid. 🔥 Let's work through this together. What happened that brought this on?",
        happy: "It's wonderful to hear you're feeling good! 🌟 Tell me more — what's making you smile today?",
        neutral: "Thanks for reaching out! I'm here and listening. 💙 What's on your mind today?",
      };
      botResponse = fallbacks[finalEmotion] || fallbacks.neutral;
    }

    // ── 4. Find or create conversation ────────────────────────────────────────
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
    }
    if (!conversation) {
      conversation = new Conversation({
        userId,
        title: message.slice(0, 55) + (message.length > 55 ? '…' : ''),
        messages: [],
      });
    }

    // ── 5. Append messages ────────────────────────────────────────────────────
    const userMessage = {
      role: 'user',
      content: message.trim(),
      emotion: finalEmotion,
      emotionScore: finalScore,
      isCrisis: emotionData.isCrisis || false,
    };
    const botMessage = { role: 'bot', content: botResponse };

    conversation.messages.push(userMessage, botMessage);
    await conversation.save();

    // ── 6. Log mood ───────────────────────────────────────────────────────────
    await MoodLog.create({
      userId,
      emotion: finalEmotion,
      score: finalScore,
      sourceText: message.trim(),
      dateKey: getTodayKey(),
      isCrisis: emotionData.isCrisis || false,
    });

    res.json({
      success: true,
      conversationId: conversation._id,
      userMessage,
      botMessage,
      emotion: finalEmotion,
      emotionScore: finalScore,
      isCrisis: emotionData.isCrisis || false,
      textEmotion: emotionData.emotion,
      faceEmotionUsed: faceEmotion,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/chat/history ─────────────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt messages')
      .lean();
    res.json({ success: true, conversations });
  } catch (error) { next(error); }
};

// ── GET /api/chat/conversation/:id ────────────────────────────────────────────
const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    res.json({ success: true, conversation });
  } catch (error) { next(error); }
};

// ── DELETE /api/chat/history ──────────────────────────────────────────────────
const clearHistory = async (req, res, next) => {
  try {
    await Conversation.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) { next(error); }
};

module.exports = { sendMessage, getHistory, getConversation, clearHistory };
