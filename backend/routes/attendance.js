const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/auth');

router.post('/attendance', authMiddleware, attendanceController.markAttendance);
router.get('/attendances', authMiddleware, attendanceController.getAttendances);
router.get('/attendance/:id', authMiddleware, attendanceController.getAttendanceById);
router.put('/attendance/:id', authMiddleware, attendanceController.updateAttendance);
router.delete('/attendance/:id', authMiddleware, attendanceController.deleteAttendance);

module.exports = router;