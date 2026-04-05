/**
 * MindEase — Mood Controller
 * Returns mood trend data for the dashboard.
 */

const MoodLog = require('../models/MoodLog');

// ── GET /api/mood/logs — last N days of mood logs ─────────────────────────────
const getLogs = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await MoodLog.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/mood/stats — aggregated emotion counts for charts ────────────────
const getStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Build per-day emotion tally
    const logs = await MoodLog.find({
      userId: req.user._id,
      createdAt: { $gte: since },
    }).lean();

    // Count each emotion
    const emotionCounts = {};
    const dailyTrend = {};

    logs.forEach((log) => {
      // Overall counts
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;

      // Daily trend: { '2024-02-01': { happy: 2, sad: 1, ... } }
      if (!dailyTrend[log.dateKey]) {
        dailyTrend[log.dateKey] = {};
      }
      dailyTrend[log.dateKey][log.emotion] =
        (dailyTrend[log.dateKey][log.emotion] || 0) + 1;
    });

    // Convert dailyTrend to array sorted by date
    const trendArray = Object.entries(dailyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, emotions]) => ({ date, ...emotions }));

    res.json({
      success: true,
      totalLogs: logs.length,
      emotionCounts,
      dailyTrend: trendArray,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogs, getStats };
