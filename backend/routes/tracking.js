// ============================================================================
// Tracking Routes
// ============================================================================
// Student progress tracking: streaks, study time, message counts
// ============================================================================

import express from 'express';
import { getStudentStats, updateActivity } from '../controllers/trackingController.js';
import { authenticateStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

// All tracking routes require student authentication
router.use(authenticateStudent);

// Get student statistics (streak, study time, etc.)
router.get('/stats', getStudentStats);

// Update activity (called after sending messages)
router.post('/activity', updateActivity);

export default router;
