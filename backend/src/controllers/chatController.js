/**
 * MindEase — Chat Controller (Gemini AI Powered)
 * Handles messages with face emotion fusion, conversation context,
 * and real AI responses powered by Google Gemini.
 */

const axios = require('axios');
const Conversation = require('../models/Conversation');
const MoodLog = require('../models/MoodLog');

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:5001';
const getTodayKey = () => new Date().toISOString().split('T')[0];

// ── Gemini AI Setup (Lazy initialization) ─────────────────────────────────────
let geminiModel = null;

function getGeminiModel() {
  if (geminiModel) return geminiModel;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in environment variables!');
    return null;
  }
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { maxOutputTokens: 400, temperature: 0.90, topP: 0.95 },
    });
    console.log('✅ Gemini AI model initialized successfully');
    return geminiModel;
  } catch (err) {
    console.error('❌ Failed to initialize Gemini:', err.message);
    return null;
  }
}

// ── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MindEase, a warm, empathetic, and highly intelligent mental health companion AI. Your role is to support users through their emotional challenges.

CRITICAL RULES — follow these ALWAYS:
1. Read the user's EXACT message and respond to the SPECIFIC content they wrote. Never give a generic reply.
2. NEVER repeat the same response twice. Each reply must be completely unique and tailored.
3. If the user says "I am sad" — acknowledge THAT specifically. If they ask for a mindfulness tip — give a specific, useful tip. If they want to vent — listen and ask follow-up questions.
4. Keep responses natural and conversational — 3-5 sentences typically. Longer only for deep emotional support.
5. Weave in practical techniques (breathing, grounding, journaling) naturally — not as a bullet list.
6. Use emojis sparingly for warmth. Never be robotic or clinical.
7. Always end with an open question that invites the user to share more.
8. If crisis is detected, gently direct them to use the SOS button visible on screen.`;

// ── Keyword-based emotion classifier (fallback if Python service is down) ─────
function detectEmotionFromText(text) {
  const t = text.toLowerCase();
  if (/\b(kill|suicide|end.it|hurt.myself|no.point|want.to.die|give.up.on.life)\b/.test(t)) return { emotion: 'neutral', score: 0.5, isCrisis: true };
  if (/\b(happy|great|amazing|wonderful|excited|joy|fantastic|love|excellent|awesome)\b/.test(t)) return { emotion: 'happy', score: 0.75, isCrisis: false };
  if (/\b(sad|unhappy|depressed|hopeless|lonely|crying|miss|grief|heartbreak|down|blue)\b/.test(t)) return { emotion: 'sad', score: 0.75, isCrisis: false };
  if (/\b(angry|furious|rage|hate|frustrated|annoyed|irritated|mad|upset|pissed)\b/.test(t)) return { emotion: 'angry', score: 0.75, isCrisis: false };
  if (/\b(anxious|anxiety|worried|nervous|panic|stress|overwhelm|scared|fear|dread)\b/.test(t)) return { emotion: 'anxious', score: 0.75, isCrisis: false };
  return { emotion: 'neutral', score: 0.5, isCrisis: false };
}

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

    // ── 1. Detect emotion (Python service with local fallback) ─────────────────
    let emotionData = detectEmotionFromText(message); // Start with local fallback
    try {
      const emotionRes = await axios.post(`${AI_SERVICE}/analyze`, { text: message }, { timeout: 6000 });
      if (emotionRes.data && emotionRes.data.emotion) {
        emotionData = emotionRes.data;
      }
    } catch {
      console.warn('⚠️  Python emotion service unavailable — using local keyword detection');
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

    // ── 3. Generate Gemini response ────────────────────────────────────────────
    let botResponse = null;

    const model = getGeminiModel();
    if (model) {
      try {
        // Build conversation history
        const chatHistory = [];
        for (const msg of context) {
          if (msg.role === 'user') {
            chatHistory.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'bot') {
            chatHistory.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        }

        const emotionCtx = emotionData.isCrisis
          ? `⚠️ CRISIS: User may be in danger. Prioritize their safety and encourage them to use the SOS button.`
          : `User's emotion: ${finalEmotion} (${Math.round(finalScore * 100)}% confidence)${faceEmotion && faceEmotion !== finalEmotion ? `. Face shows: ${faceEmotion}.` : ''}`;

        const fullPrompt = `${SYSTEM_PROMPT}\n\n${emotionCtx}\n\nUser's message: "${message.trim()}"`;

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(fullPrompt);
        botResponse = result.response.text().trim();

        if (!botResponse || botResponse.length < 10) throw new Error('Empty response from Gemini');
        console.log(`✅ Gemini responded (${botResponse.length} chars) for emotion: ${finalEmotion}`);

      } catch (geminiErr) {
        console.error('❌ Gemini API error:', geminiErr.message);
        botResponse = null;
      }
    } else {
      console.error('❌ Gemini model unavailable — check GEMINI_API_KEY env variable');
    }

    // ── Smart fallbacks (emotion-specific, never generic) ─────────────────────
    if (!botResponse) {
      const fallbacks = {
        sad: [
          `I can hear that you're going through something heavy right now. 💙 You don't have to carry this alone. What's been weighing on you the most today?`,
          `Sadness can feel so isolating, but reaching out like this is a really brave step. I'm right here with you. Can you tell me what's been happening?`,
          `Thank you for trusting me with this. 💜 Whatever you're feeling, it's completely valid. What would feel most helpful right now — talking it through, or a calming technique?`,
        ],
        anxious: [
          `That anxious feeling is so uncomfortable to sit with. 💜 Let's take this one breath at a time — in for 4, out for 6. What's been triggering this for you?`,
          `Anxiety has a way of making everything feel urgent and overwhelming. You're not alone in this. 🌬️ What's your mind racing about most right now?`,
          `I hear you — anxiety can be exhausting. Can you tell me what's been happening? Sometimes just saying it out loud helps lighten the weight of it.`,
        ],
        angry: [
          `Your frustration makes complete sense — anger is telling you something important. 🔥 What happened that brought this on?`,
          `I can feel the intensity of what you're sharing, and your feelings are completely valid. What's been the biggest trigger for you today?`,
          `Anger is often protecting something deeper. I'm not here to rush you — what do you most need right now? To vent, to problem-solve, or just to be heard?`,
        ],
        happy: [
          `It's genuinely wonderful to hear you're feeling good! 🌟 What's been making you smile today? I'd love to hear about it.`,
          `That positive energy is beautiful — hold onto it! ✨ What's been the highlight of your day so far?`,
          `Happy days are worth savoring. 😊 What's behind this good mood? Tell me more!`,
        ],
        neutral: [
          `Thanks for checking in! I'm fully here and listening. 💙 What's been on your mind lately — is there something specific you'd like to explore or talk through?`,
          `I'm glad you're here. Sometimes we don't need a big reason to reach out — just wanting to talk is enough. What would feel useful for you today?`,
          `It's great to hear from you. 🌿 Whether you have something specific on your mind or just want to chat, I'm here. What's going on?`,
        ],
      };

      if (emotionData.isCrisis) {
        botResponse = `🆘 I'm really concerned about you right now, and I want you to know that you matter deeply. Please tap the **SOS button** on your screen — it has direct helplines available 24/7.\n\n**iCall India:** 9152987821 | **Vandrevala Foundation:** 1860-2662-345 (24/7)\n\nYou don't have to face this alone. I'm right here with you. Can you tell me what's been happening?`;
      } else {
        const options = fallbacks[finalEmotion] || fallbacks.neutral;
        botResponse = options[Math.floor(Math.random() * options.length)];
      }
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

    // ── 5. Log mood ───────────────────────────────────────────────────────────
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
