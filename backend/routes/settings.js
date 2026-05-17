const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

// Get about data (Public or Protected depending on needs, made public for login screens if needed, otherwise protected)
router.get('/about', settingsController.getSettings);

// Update about data (Protected)
router.put('/about', authMiddleware, settingsController.updateSettings);

module.exports = router;
