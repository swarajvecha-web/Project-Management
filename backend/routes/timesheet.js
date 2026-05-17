const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheetController');
const authMiddleware = require('../middleware/auth');

router.post('/timesheet', authMiddleware, timesheetController.createTimesheet);
router.get('/timesheets', authMiddleware, timesheetController.getTimesheets);
router.get('/timesheet/:id', authMiddleware, timesheetController.getTimesheetById);
router.put('/timesheet/:id', authMiddleware, timesheetController.updateTimesheet);
router.delete('/timesheet/:id', authMiddleware, timesheetController.deleteTimesheet);
router.get('/timesheets-stats', authMiddleware, timesheetController.getTimesheetsStats);

module.exports = router;