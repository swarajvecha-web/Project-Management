const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

router.post('/task', authMiddleware, taskController.createTask);
router.get('/tasks', authMiddleware, taskController.getTasks);
router.get('/task/:id', authMiddleware, taskController.getTaskById);
router.put('/task/:id', authMiddleware, taskController.updateTask);
router.delete('/task/:id', authMiddleware, taskController.deleteTask);
router.put('/task/:id/status', authMiddleware, taskController.updateTaskStatus);
router.post('/task/:id/comment', authMiddleware, taskController.addTaskComment);
router.put('/task/:id/comment/:commentId', authMiddleware, taskController.editTaskComment);
router.delete('/task/:id/comment/:commentId', authMiddleware, taskController.deleteTaskComment);

module.exports = router;