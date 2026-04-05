/**
 * MindEase — Mood Routes
 */

const express = require('express');
const { getLogs, getStats } = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/logs', getLogs);
router.get('/stats', getStats);

module.exports = router;
