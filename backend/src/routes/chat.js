/**
 * MindEase — Chat Routes
 */

const express = require('express');
const { sendMessage, getHistory, getConversation, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All chat routes require auth
router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getHistory);
router.get('/conversation/:id', getConversation);
router.delete('/history', clearHistory);

module.exports = router;
