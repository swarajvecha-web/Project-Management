const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/auth');

router.post('/employee', authMiddleware, employeeController.createEmployee);
router.get('/employees', authMiddleware, employeeController.getEmployees);
router.get('/employee/:id', authMiddleware, employeeController.getEmployeeById);
router.put('/employee/:id', authMiddleware, employeeController.updateEmployee);
router.delete('/employee/:id', authMiddleware, employeeController.deleteEmployee);
router.get('/employees-stats', authMiddleware, employeeController.getEmployeeStats);

module.exports = router;