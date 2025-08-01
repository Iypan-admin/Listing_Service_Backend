// routes/batchesRoutes.js

const express = require('express');
const router = express.Router();
const batchesController = require('../controllers/batchesController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint to fetch all batches (secured via auth middleware)
router.get('/admin/batches', authMiddleware, batchesController.getAllBatches);

// Endpoint to fetch a single batch by ID (secured via auth middleware)
router.get('/batches/:id', authMiddleware, batchesController.getBatchById);

// Add this route with your other routes
router.get('/batchcenter/:centerId', authMiddleware, batchesController.getBatchesByCenter);

module.exports = router;
