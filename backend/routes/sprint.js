const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');
const authMiddleware = require('../middleware/auth');

router.post('/sprint', authMiddleware, sprintController.createSprint);
router.get('/sprints', authMiddleware, sprintController.getSprints);
router.get('/sprint/:id', authMiddleware, sprintController.getSprintById);
router.put('/sprint/:id', authMiddleware, sprintController.updateSprint);
router.delete('/sprint/:id', authMiddleware, sprintController.deleteSprint);

module.exports = router;
