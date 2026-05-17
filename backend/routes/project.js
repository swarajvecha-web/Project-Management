const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

router.post('/project', authMiddleware, projectController.createProject);
router.get('/projects', authMiddleware, projectController.getProjects);
router.get('/project/:id', authMiddleware, projectController.getProjectById);
router.put('/project/:id', authMiddleware, projectController.updateProject);
router.delete('/project/:id', authMiddleware, projectController.deleteProject);
router.put('/project/:id/status', authMiddleware, projectController.updateProjectStatus);

module.exports = router;