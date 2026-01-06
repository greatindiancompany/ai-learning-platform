-- Check actual column structure of tool tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN (
    'student_goals',
    'student_habits',
    'student_notes',
    'student_visual_learning',
    'student_study_plans'
)
ORDER BY table_name, ordinal_position;
