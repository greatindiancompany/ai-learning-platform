-- Show actual columns in student_goals table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'student_goals'
ORDER BY ordinal_position;
