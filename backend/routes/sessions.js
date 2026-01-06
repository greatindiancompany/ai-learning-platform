// ============================================================================
// SESSION MANAGEMENT ROUTES
// ============================================================================
// Handles student session creation, tracking, and termination
// Used for memory system context and analytics
// ============================================================================

import express from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { authenticateStudent } from '../middleware/authMiddleware.js';
import crypto from 'crypto';

const router = express.Router();

// ============================================================================
// CREATE STUDENT SESSION
// ============================================================================
// POST /api/sessions/create
// Creates a new session for tracking student activity

router.post('/create', authenticateStudent, async (req, res) => {
  try {
    const {
      device_type,
      browser,
      screen_width,
      screen_height
    } = req.body;

    // Generate unique session token
    const sessionToken = crypto.randomUUID();

    const now = new Date();
    const hour = now.getHours();

    // Determine time of day
    let timeOfDay = 'night';
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';

    const { data, error } = await supabase
      .from('student_sessions')
      .insert({
        student_id: req.student_id,
        session_token: sessionToken,
        device_type: device_type || 'unknown',
        browser: browser || 'unknown',
        user_agent: req.headers['user-agent'] || '',
        screen_width: screen_width || null,
        screen_height: screen_height || null,
        time_of_day: timeOfDay,
        day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
        tools_used: []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    console.log(`✅ Created session ${sessionToken} for student ${req.student_id}`);

    res.json({
      success: true,
      session_token: sessionToken,
      session_id: data.id
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message
    });
  }
});

// ============================================================================
// END STUDENT SESSION
// ============================================================================
// POST /api/sessions/end
// Ends a session and calculates duration

router.post('/end', authenticateStudent, async (req, res) => {
  try {
    const { session_token } = req.body;

    if (!session_token) {
      return res.status(400).json({ error: 'Session token required' });
    }

    // Get session to calculate duration
    const { data: session, error: fetchError } = await supabase
      .from('student_sessions')
      .select('started_at')
      .eq('session_token', session_token)
      .eq('student_id', req.student_id)
      .single();

    if (fetchError || !session) {
      console.error('Session not found:', fetchError);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Calculate session duration
    const durationSeconds = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    // Update session
    const { error: updateError } = await supabase
      .from('student_sessions')
      .update({
        ended_at: new Date().toISOString(),
        session_duration_seconds: durationSeconds
      })
      .eq('session_token', session_token)
      .eq('student_id', req.student_id);

    if (updateError) {
      console.error('Error ending session:', updateError);
      throw updateError;
    }

    console.log(`✅ Ended session ${session_token} (${durationSeconds}s)`);

    res.json({
      success: true,
      duration_seconds: durationSeconds
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error.message
    });
  }
});

// ============================================================================
// UPDATE SESSION ACTIVITY
// ============================================================================
// PATCH /api/sessions/activity
// Updates last activity timestamp

router.patch('/activity', authenticateStudent, async (req, res) => {
  try {
    const { session_token } = req.body;

    if (!session_token) {
      return res.status(400).json({ error: 'Session token required' });
    }

    const { error } = await supabase
      .from('student_sessions')
      .update({
        last_activity_at: new Date().toISOString()
      })
      .eq('session_token', session_token)
      .eq('student_id', req.student_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating session activity:', error);
    res.status(500).json({
      error: 'Failed to update activity',
      message: error.message
    });
  }
});

// ============================================================================
// TRACK TOOL USAGE
// ============================================================================
// POST /api/sessions/tool-used
// Adds a tool to the session's tools_used array

router.post('/tool-used', authenticateStudent, async (req, res) => {
  try {
    const { session_token, tool_name } = req.body;

    if (!session_token || !tool_name) {
      return res.status(400).json({
        error: 'Session token and tool name required'
      });
    }

    // Get current tools_used array
    const { data: session } = await supabase
      .from('student_sessions')
      .select('tools_used')
      .eq('session_token', session_token)
      .eq('student_id', req.student_id)
      .single();

    if (session) {
      const toolsUsed = session.tools_used || [];
      toolsUsed.push(tool_name);

      await supabase
        .from('student_sessions')
        .update({
          tools_used: toolsUsed,
          last_activity_at: new Date().toISOString()
        })
        .eq('session_token', session_token)
        .eq('student_id', req.student_id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking tool usage:', error);
    res.status(500).json({
      error: 'Failed to track tool usage',
      message: error.message
    });
  }
});

export default router;
