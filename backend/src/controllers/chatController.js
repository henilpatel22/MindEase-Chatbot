/**
 * MindEase — Chat Controller (Advanced)
 * Handles messages with face emotion fusion, conversation context,
 * and mood deterioration detection.
 */

const axios = require('axios');
const Conversation = require('../models/Conversation');
const MoodLog = require('../models/MoodLog');

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:5001';
const getTodayKey = () => new Date().toISOString().split('T')[0];

// ── POST /api/chat/message ────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const {
      message,
      conversationId,
      context = [],          // last N { role, content } messages for AI context
      faceEmotion = null,    // emotion detected by browser face-api
      faceEmotionScore = null,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const userId = req.user._id;

    // ── 1. Detect text emotion ────────────────────────────────────────────────
    let emotionData = { emotion: 'neutral', score: 0.5, isCrisis: false };
    try {
      const emotionRes = await axios.post(`${AI_SERVICE}/analyze`, { text: message }, { timeout: 10000 });
      emotionData = emotionRes.data;
    } catch {
      console.warn('⚠️  AI emotion service unavailable');
    }

    // ── 2. Combine text + face emotion (server-side) ──────────────────────────
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
        if (faceW > textW) {
          finalEmotion = faceEmotion;
          finalScore   = faceEmotionScore;
        }
      }
    }

    // ── 3. Generate AI response with context ──────────────────────────────────
    let botResponse = "I'm here for you. Please feel free to share more.";
    try {
      const responseRes = await axios.post(
        `${AI_SERVICE}/respond`,
        {
          text: message,
          emotion: finalEmotion,
          score: finalScore,
          isCrisis: emotionData.isCrisis,
          context,                          // pass conversation context
          faceEmotion,
          faceEmotionScore,
        },
        { timeout: 10000 }
      );
      botResponse = responseRes.data.response;
    } catch {
      /* use fallback */
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
