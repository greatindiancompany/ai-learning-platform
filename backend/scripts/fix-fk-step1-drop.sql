-- ============================================
-- STEP 1: DROP ALL FOREIGN KEY CONSTRAINTS
-- ============================================
-- Run this first to remove old constraints

ALTER TABLE IF EXISTS student_sketches DROP CONSTRAINT IF EXISTS student_sketches_student_id_fkey;
ALTER TABLE IF EXISTS student_quizzes DROP CONSTRAINT IF EXISTS student_quizzes_student_id_fkey;
ALTER TABLE IF EXISTS student_quiz_attempts DROP CONSTRAINT IF EXISTS student_quiz_attempts_student_id_fkey;
ALTER TABLE IF EXISTS student_flashcard_decks DROP CONSTRAINT IF EXISTS student_flashcard_decks_student_id_fkey;
ALTER TABLE IF EXISTS student_practice_tests DROP CONSTRAINT IF EXISTS student_practice_tests_student_id_fkey;
ALTER TABLE IF EXISTS student_test_attempts DROP CONSTRAINT IF EXISTS student_test_attempts_student_id_fkey;
ALTER TABLE IF EXISTS student_study_sessions DROP CONSTRAINT IF EXISTS student_study_sessions_student_id_fkey;
ALTER TABLE IF EXISTS student_habits DROP CONSTRAINT IF EXISTS student_habits_student_id_fkey;
ALTER TABLE IF EXISTS student_habit_completions DROP CONSTRAINT IF EXISTS student_habit_completions_student_id_fkey;
ALTER TABLE IF EXISTS student_music_playlists DROP CONSTRAINT IF EXISTS student_music_playlists_student_id_fkey;
ALTER TABLE IF EXISTS student_music_history DROP CONSTRAINT IF EXISTS student_music_history_student_id_fkey;
ALTER TABLE IF EXISTS student_image_analyses DROP CONSTRAINT IF EXISTS student_image_analyses_student_id_fkey;
ALTER TABLE IF EXISTS student_math_problems DROP CONSTRAINT IF EXISTS student_math_problems_student_id_fkey;
ALTER TABLE IF EXISTS student_science_experiments DROP CONSTRAINT IF EXISTS student_science_experiments_student_id_fkey;
ALTER TABLE IF EXISTS student_visual_learning DROP CONSTRAINT IF EXISTS student_visual_learning_student_id_fkey;
ALTER TABLE IF EXISTS student_notes DROP CONSTRAINT IF EXISTS student_notes_student_id_fkey;
ALTER TABLE IF EXISTS student_study_plans DROP CONSTRAINT IF EXISTS student_study_plans_student_id_fkey;
ALTER TABLE IF EXISTS student_study_tasks DROP CONSTRAINT IF EXISTS student_study_tasks_student_id_fkey;
ALTER TABLE IF EXISTS student_goals DROP CONSTRAINT IF EXISTS student_goals_student_id_fkey;
ALTER TABLE IF EXISTS student_goal_milestones DROP CONSTRAINT IF EXISTS student_goal_milestones_student_id_fkey;
