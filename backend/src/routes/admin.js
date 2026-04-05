/**
 * MindEase — Admin Routes
 */

const express = require('express');
const { getUsers, getActivity, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/users', getUsers);
router.get('/activity', getActivity);
router.delete('/users/:id', deleteUser);

module.exports = router;
