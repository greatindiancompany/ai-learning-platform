-- ============================================================================
-- VERIFY MEMORY SYSTEM TABLES
-- ============================================================================
-- Run this in Supabase SQL Editor to verify all tables were created
-- ============================================================================

-- Check all 4 tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('student_memory', 'conversation_summaries', 'student_sessions', 'student_analytics')
ORDER BY table_name;

-- Expected output:
-- conversation_summaries    8
-- student_analytics         11
-- student_memory           11
-- student_sessions         15
