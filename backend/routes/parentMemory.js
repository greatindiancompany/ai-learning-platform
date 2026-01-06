// ============================================================================
// PARENT MEMORY MANAGEMENT ROUTES
// ============================================================================
// Allows parents to view and manage student memory facts
// ============================================================================

import express from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { authenticateParent } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// GET STUDENT MEMORY FACTS
// ============================================================================
// GET /api/parents/students/:studentId/memory
// Returns all active memory facts for a student

router.get('/students/:studentId/memory', authenticateParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent owns this student
    const { data: student, error: studentError } = await supabase
      .from('student_accounts')
      .select('id, display_name')
      .eq('id', studentId)
      .eq('parent_id', req.parent_id)
      .single();

    if (studentError || !student) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Student not found or does not belong to this parent'
      });
    }

    // Get all active memory facts
    const { data: memory, error: memoryError } = await supabase
      .from('student_memory')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (memoryError) {
      console.error('Error fetching memory:', memoryError);
      throw memoryError;
    }

    res.json({
      success: true,
      student: student,
      memory: memory || []
    });
  } catch (error) {
    console.error('Error getting student memory:', error);
    res.status(500).json({
      error: 'Failed to get student memory',
      message: error.message
    });
  }
});

// ============================================================================
// DELETE MEMORY FACT
// ============================================================================
// DELETE /api/parents/students/:studentId/memory/:factId
// Deactivates a specific memory fact

router.delete('/students/:studentId/memory/:factId', authenticateParent, async (req, res) => {
  try {
    const { studentId, factId } = req.params;

    // Verify parent owns this student
    const { data: student, error: studentError } = await supabase
      .from('student_accounts')
      .select('id')
      .eq('id', studentId)
      .eq('parent_id', req.parent_id)
      .single();

    if (studentError || !student) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Student not found or does not belong to this parent'
      });
    }

    // Deactivate the memory fact (soft delete)
    const { error: deleteError } = await supabase
      .from('student_memory')
      .update({ is_active: false })
      .eq('id', factId)
      .eq('student_id', studentId);

    if (deleteError) {
      console.error('Error deleting memory fact:', deleteError);
      throw deleteError;
    }

    res.json({
      success: true,
      message: 'Memory fact deleted'
    });
  } catch (error) {
    console.error('Error deleting memory fact:', error);
    res.status(500).json({
      error: 'Failed to delete memory fact',
      message: error.message
    });
  }
});

// ============================================================================
// CLEAR ALL MEMORY
// ============================================================================
// DELETE /api/parents/students/:studentId/memory
// Deactivates all memory facts for a student

router.delete('/students/:studentId/memory', authenticateParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent owns this student
    const { data: student, error: studentError } = await supabase
      .from('student_accounts')
      .select('id')
      .eq('id', studentId)
      .eq('parent_id', req.parent_id)
      .single();

    if (studentError || !student) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Student not found or does not belong to this parent'
      });
    }

    // Deactivate all memory facts
    const { error: clearError } = await supabase
      .from('student_memory')
      .update({ is_active: false })
      .eq('student_id', studentId);

    if (clearError) {
      console.error('Error clearing memory:', clearError);
      throw clearError;
    }

    console.log(`✅ Cleared all memory for student ${studentId}`);

    res.json({
      success: true,
      message: 'All memory cleared'
    });
  } catch (error) {
    console.error('Error clearing memory:', error);
    res.status(500).json({
      error: 'Failed to clear memory',
      message: error.message
    });
  }
});

// ============================================================================
// GET STUDENT ANALYTICS
// ============================================================================
// GET /api/parents/students/:studentId/analytics
// Returns usage analytics for a student

router.get('/students/:studentId/analytics', authenticateParent, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify parent owns this student
    const { data: student, error: studentError } = await supabase
      .from('student_accounts')
      .select('id, display_name')
      .eq('id', studentId)
      .eq('parent_id', req.parent_id)
      .single();

    if (studentError || !student) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Student not found or does not belong to this parent'
      });
    }

    // Get analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('student_analytics')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      // PGRST116 = no rows, which is okay
      console.error('Error fetching analytics:', analyticsError);
      throw analyticsError;
    }

    // Get recent sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('student_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    }

    res.json({
      success: true,
      student: student,
      analytics: analytics || null,
      recent_sessions: sessions || []
    });
  } catch (error) {
    console.error('Error getting student analytics:', error);
    res.status(500).json({
      error: 'Failed to get student analytics',
      message: error.message
    });
  }
});

export default router;
