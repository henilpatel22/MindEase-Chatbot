/**
 * MindEase — MoodLog Model
 * Tracks user mood snapshots over time for dashboard analytics.
 */

const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emotion: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'anxious', 'neutral', 'surprised'],
      required: true,
    },
    score: {
      type: Number,   // confidence 0.0 – 1.0
      required: true,
    },
    // Raw text that triggered this mood log
    sourceText: {
      type: String,
      trim: true,
    },
    // Date string 'YYYY-MM-DD' for easy grouping in queries
    dateKey: {
      type: String,
      required: true,
    },
    isCrisis: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for dashboard queries (user + date range)
moodLogSchema.index({ userId: 1, dateKey: 1 });

module.exports = mongoose.model('MoodLog', moodLogSchema);
