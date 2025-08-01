// routes/teachersRoutes.js

const express = require('express');
const teachersController = require('../controllers/teachersController');
const authMiddleware = require('../middleware/authMiddleware'); // Fix: 'middleware' instead of 'middlewares'

const router = express.Router();

// Endpoint to fetch all teachers (secured via auth middleware)
router.get('/teachers', authMiddleware, teachersController.getAllTeachers);

// Endpoint to fetch a single teacher by ID (secured via auth middleware)
router.get('/teachers/:id', authMiddleware, teachersController.getTeacherById);

// Teacher-specific endpoints
router.get('/batches', authMiddleware, teachersController.getTeacherBatches);
router.get('/students', authMiddleware, teachersController.getStudentsByTeacher);
router.get('/batch/:batchId/students', authMiddleware, teachersController.getTeacherBatchStudents);
// router.get(':batchId/students', authMiddleware, teachersController.getTeacherBatchStudents);

// Add this new route
router.get('/center/:centerId/teachers', authMiddleware, teachersController.getTeachersByCenter);

module.exports = router;
