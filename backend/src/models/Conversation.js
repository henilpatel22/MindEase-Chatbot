/**
 * MindEase — Conversation Model
 * Stores all chat messages for a user session.
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Emotion detected for user messages (null for bot messages)
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'anxious', 'neutral', 'surprised', null],
      default: null,
    },
    emotionScore: {
      type: Number,  // confidence score 0.0 – 1.0
      default: null,
    },
    // Whether this message triggered a crisis alert
    isCrisis: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
    // Title derived from the first user message
    title: {
      type: String,
      default: 'New Conversation',
    },
  },
  { timestamps: true }
);

// Index for fast user-specific queries
conversationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
