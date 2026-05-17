const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.post('/notification', authMiddleware, notificationController.createNotification);
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.get('/notification/:id', authMiddleware, notificationController.getNotificationById);
router.put('/notification/:id', authMiddleware, notificationController.updateNotification);
router.delete('/notification/:id', authMiddleware, notificationController.deleteNotification);
router.put('/notification/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
