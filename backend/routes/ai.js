const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.post('/ai/suggest', authMiddleware, aiController.suggestTaskDetails);

module.exports = router;
