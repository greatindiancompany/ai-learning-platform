-- ============================================
-- FINAL FIX: Remove empty students table and fix all FKs
-- ============================================

-- Step 1: Drop all foreign key constraints
ALTER TABLE IF EXISTS student_sketches DROP CONSTRAINT IF EXISTS student_sketches_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_quizzes DROP CONSTRAINT IF EXISTS student_quizzes_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_quiz_attempts DROP CONSTRAINT IF EXISTS student_quiz_attempts_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_flashcard_decks DROP CONSTRAINT IF EXISTS student_flashcard_decks_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_practice_tests DROP CONSTRAINT IF EXISTS student_practice_tests_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_test_attempts DROP CONSTRAINT IF EXISTS student_test_attempts_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_study_sessions DROP CONSTRAINT IF EXISTS student_study_sessions_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_habits DROP CONSTRAINT IF EXISTS student_habits_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_habit_completions DROP CONSTRAINT IF EXISTS student_habit_completions_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_music_playlists DROP CONSTRAINT IF EXISTS student_music_playlists_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_music_history DROP CONSTRAINT IF EXISTS student_music_history_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_image_analyses DROP CONSTRAINT IF EXISTS student_image_analyses_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_math_problems DROP CONSTRAINT IF EXISTS student_math_problems_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_science_experiments DROP CONSTRAINT IF EXISTS student_science_experiments_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_visual_learning DROP CONSTRAINT IF EXISTS student_visual_learning_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_notes DROP CONSTRAINT IF EXISTS student_notes_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_study_plans DROP CONSTRAINT IF EXISTS student_study_plans_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_study_tasks DROP CONSTRAINT IF EXISTS student_study_tasks_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_goals DROP CONSTRAINT IF EXISTS student_goals_student_id_fkey CASCADE;
ALTER TABLE IF EXISTS student_goal_milestones DROP CONSTRAINT IF EXISTS student_goal_milestones_student_id_fkey CASCADE;

-- Step 2: Drop the empty students table
DROP TABLE IF EXISTS students CASCADE;

-- Step 3: Add correct foreign key constraints pointing to student_accounts
ALTER TABLE student_sketches ADD CONSTRAINT student_sketches_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_quizzes ADD CONSTRAINT student_quizzes_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_quiz_attempts ADD CONSTRAINT student_quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_flashcard_decks ADD CONSTRAINT student_flashcard_decks_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_practice_tests ADD CONSTRAINT student_practice_tests_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_test_attempts ADD CONSTRAINT student_test_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_study_sessions ADD CONSTRAINT student_study_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_habits ADD CONSTRAINT student_habits_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_habit_completions ADD CONSTRAINT student_habit_completions_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_music_playlists ADD CONSTRAINT student_music_playlists_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_music_history ADD CONSTRAINT student_music_history_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_image_analyses ADD CONSTRAINT student_image_analyses_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_math_problems ADD CONSTRAINT student_math_problems_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_science_experiments ADD CONSTRAINT student_science_experiments_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_visual_learning ADD CONSTRAINT student_visual_learning_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_notes ADD CONSTRAINT student_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_study_plans ADD CONSTRAINT student_study_plans_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_study_tasks ADD CONSTRAINT student_study_tasks_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_goals ADD CONSTRAINT student_goals_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
ALTER TABLE student_goal_milestones ADD CONSTRAINT student_goal_milestones_student_id_fkey FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
