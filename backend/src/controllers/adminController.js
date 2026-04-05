/**
 * MindEase — Admin Controller
 * Admin-only endpoints for user and activity management.
 */

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const MoodLog = require('../models/MoodLog');

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/activity ───────────────────────────────────────────────────
const getActivity = async (req, res, next) => {
  try {
    const [totalUsers, totalConversations, totalMoodLogs, recentUsers] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      MoodLog.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt role').lean(),
    ]);

    // Crisis events in last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const crisisCount = await MoodLog.countDocuments({ isCrisis: true, createdAt: { $gte: since } });

    res.json({
      success: true,
      stats: { totalUsers, totalConversations, totalMoodLogs, crisisCount },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Clean up their data
    await Promise.all([
      Conversation.deleteMany({ userId: req.params.id }),
      MoodLog.deleteMany({ userId: req.params.id }),
    ]);
    res.json({ success: true, message: 'User and their data deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getActivity, deleteUser };
