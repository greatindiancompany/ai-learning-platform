// ============================================================================
// Tracking Controller
// ============================================================================
// Handles student progress tracking: streaks, study time, message counts
// ============================================================================

import { supabase } from '../utils/supabaseClient.js';

// ============================================================================
// GET STUDENT STATS
// ============================================================================

/**
 * Get student statistics (streaks, study time, message count)
 * GET /api/tracking/stats
 * Requires: Student authentication
 */
export const getStudentStats = async (req, res) => {
    try {
        const student_id = req.student_id;

        if (!student_id) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Student login required'
            });
        }

        // Fetch student account with tracking data
        const { data: student, error } = await supabase
            .from('student_accounts')
            .select('streak_days, last_active_at, total_messages, total_study_time')
            .eq('id', student_id)
            .single();

        if (error || !student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        // Calculate today's study time
        const { data: todayMessages } = await supabase
            .from('chat_messages')
            .select('created_at')
            .eq('student_id', student_id)
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
            .order('created_at', { ascending: true });

        // Estimate study time based on messages (rough: 2 minutes per message exchange)
        const todayStudyTime = todayMessages ? Math.ceil(todayMessages.length * 2) : 0;

        res.json({
            success: true,
            stats: {
                streak_days: student.streak_days || 0,
                last_active_at: student.last_active_at,
                total_messages: student.total_messages || 0,
                total_study_time: student.total_study_time || 0,
                today_study_time: todayStudyTime
            }
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({
            error: 'Failed to fetch stats',
            message: 'An error occurred while fetching student statistics'
        });
    }
};

// ============================================================================
// UPDATE ACTIVITY (Called on message send)
// ============================================================================

/**
 * Update student activity tracking
 * Called automatically when student sends messages
 * POST /api/tracking/activity
 * Requires: Student authentication
 */
export const updateActivity = async (req, res) => {
    try {
        const student_id = req.student_id;

        if (!student_id) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        // Fetch current student data
        const { data: student, error: fetchError } = await supabase
            .from('student_accounts')
            .select('last_active_at, streak_days, total_messages, total_study_time')
            .eq('id', student_id)
            .single();

        if (fetchError || !student) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        const now = new Date();
        const lastActive = student.last_active_at ? new Date(student.last_active_at) : null;

        // Calculate streak (using calendar days, not 24-hour periods)
        let newStreak = student.streak_days || 0;

        if (lastActive) {
            // Compare calendar days by zeroing out the time
            const lastActiveDate = new Date(lastActive);
            lastActiveDate.setHours(0, 0, 0, 0);

            const todayDate = new Date(now);
            todayDate.setHours(0, 0, 0, 0);

            const daysSinceLastActive = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));

            if (daysSinceLastActive === 0) {
                // Same calendar day - keep streak
                newStreak = student.streak_days || 1;
            } else if (daysSinceLastActive === 1) {
                // Next calendar day - increment streak
                newStreak = (student.streak_days || 0) + 1;
            } else {
                // Streak broken (missed a day) - reset to 1
                newStreak = 1;
            }
        } else {
            // First time - start streak at 1
            newStreak = 1;
        }

        // Update student record
        const { error: updateError } = await supabase
            .from('student_accounts')
            .update({
                last_active_at: now.toISOString(),
                streak_days: newStreak,
                total_messages: (student.total_messages || 0) + 1,
                total_study_time: (student.total_study_time || 0) + 2 // Rough estimate: 2 min per message
            })
            .eq('id', student_id);

        if (updateError) {
            console.error('Error updating activity:', updateError);
            throw updateError;
        }

        res.json({
            success: true,
            streak_days: newStreak,
            total_messages: (student.total_messages || 0) + 1
        });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({
            error: 'Failed to update activity',
            message: 'An error occurred while updating activity tracking'
        });
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    getStudentStats,
    updateActivity
};
