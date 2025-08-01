// routes/studentsRoutes.js

const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint to fetch all students (secured via auth middleware)
router.get('/students', authMiddleware, studentsController.getAllStudents);

// Endpoint to fetch a single student by ID (secured via auth middleware)
router.get('/students/:id', authMiddleware, studentsController.getStudentById);

// Endpoint to fetch students by batch ID
router.get('/students/batch/:batchId', studentsController.getStudentsByBatch);

// Add this route with your other routes
router.get('/center/:centerId', authMiddleware, studentsController.getStudentsByCenter);

module.exports = router;
