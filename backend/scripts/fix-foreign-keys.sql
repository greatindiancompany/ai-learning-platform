-- ============================================
-- FIX FOREIGN KEY CONSTRAINTS
-- ============================================
-- Drop all foreign key constraints that reference 'students'
-- and recreate them to reference 'student_accounts'

-- 1. student_sketches
ALTER TABLE IF EXISTS student_sketches
DROP CONSTRAINT IF EXISTS student_sketches_student_id_fkey;

ALTER TABLE IF EXISTS student_sketches
ADD CONSTRAINT student_sketches_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 2. student_quizzes
ALTER TABLE IF EXISTS student_quizzes
DROP CONSTRAINT IF EXISTS student_quizzes_student_id_fkey;

ALTER TABLE IF EXISTS student_quizzes
ADD CONSTRAINT student_quizzes_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 3. student_quiz_attempts
ALTER TABLE IF EXISTS student_quiz_attempts
DROP CONSTRAINT IF EXISTS student_quiz_attempts_student_id_fkey;

ALTER TABLE IF EXISTS student_quiz_attempts
ADD CONSTRAINT student_quiz_attempts_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 4. student_flashcard_decks
ALTER TABLE IF EXISTS student_flashcard_decks
DROP CONSTRAINT IF EXISTS student_flashcard_decks_student_id_fkey;

ALTER TABLE IF EXISTS student_flashcard_decks
ADD CONSTRAINT student_flashcard_decks_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 5. student_practice_tests
ALTER TABLE IF EXISTS student_practice_tests
DROP CONSTRAINT IF EXISTS student_practice_tests_student_id_fkey;

ALTER TABLE IF EXISTS student_practice_tests
ADD CONSTRAINT student_practice_tests_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 6. student_test_attempts
ALTER TABLE IF EXISTS student_test_attempts
DROP CONSTRAINT IF EXISTS student_test_attempts_student_id_fkey;

ALTER TABLE IF EXISTS student_test_attempts
ADD CONSTRAINT student_test_attempts_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 7. student_study_sessions
ALTER TABLE IF EXISTS student_study_sessions
DROP CONSTRAINT IF EXISTS student_study_sessions_student_id_fkey;

ALTER TABLE IF EXISTS student_study_sessions
ADD CONSTRAINT student_study_sessions_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 8. student_habits
ALTER TABLE IF EXISTS student_habits
DROP CONSTRAINT IF EXISTS student_habits_student_id_fkey;

ALTER TABLE IF EXISTS student_habits
ADD CONSTRAINT student_habits_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 9. student_habit_completions
ALTER TABLE IF EXISTS student_habit_completions
DROP CONSTRAINT IF EXISTS student_habit_completions_student_id_fkey;

ALTER TABLE IF EXISTS student_habit_completions
ADD CONSTRAINT student_habit_completions_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 10. student_music_playlists
ALTER TABLE IF EXISTS student_music_playlists
DROP CONSTRAINT IF EXISTS student_music_playlists_student_id_fkey;

ALTER TABLE IF EXISTS student_music_playlists
ADD CONSTRAINT student_music_playlists_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 11. student_music_history
ALTER TABLE IF EXISTS student_music_history
DROP CONSTRAINT IF EXISTS student_music_history_student_id_fkey;

ALTER TABLE IF EXISTS student_music_history
ADD CONSTRAINT student_music_history_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 12. student_image_analyses
ALTER TABLE IF EXISTS student_image_analyses
DROP CONSTRAINT IF EXISTS student_image_analyses_student_id_fkey;

ALTER TABLE IF EXISTS student_image_analyses
ADD CONSTRAINT student_image_analyses_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 13. student_math_problems
ALTER TABLE IF EXISTS student_math_problems
DROP CONSTRAINT IF EXISTS student_math_problems_student_id_fkey;

ALTER TABLE IF EXISTS student_math_problems
ADD CONSTRAINT student_math_problems_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 14. student_science_experiments
ALTER TABLE IF EXISTS student_science_experiments
DROP CONSTRAINT IF EXISTS student_science_experiments_student_id_fkey;

ALTER TABLE IF EXISTS student_science_experiments
ADD CONSTRAINT student_science_experiments_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 15. student_visual_learning
ALTER TABLE IF EXISTS student_visual_learning
DROP CONSTRAINT IF EXISTS student_visual_learning_student_id_fkey;

ALTER TABLE IF EXISTS student_visual_learning
ADD CONSTRAINT student_visual_learning_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 16. student_notes
ALTER TABLE IF EXISTS student_notes
DROP CONSTRAINT IF EXISTS student_notes_student_id_fkey;

ALTER TABLE IF EXISTS student_notes
ADD CONSTRAINT student_notes_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 17. student_study_plans
ALTER TABLE IF EXISTS student_study_plans
DROP CONSTRAINT IF EXISTS student_study_plans_student_id_fkey;

ALTER TABLE IF EXISTS student_study_plans
ADD CONSTRAINT student_study_plans_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 18. student_study_tasks
ALTER TABLE IF EXISTS student_study_tasks
DROP CONSTRAINT IF EXISTS student_study_tasks_student_id_fkey;

ALTER TABLE IF EXISTS student_study_tasks
ADD CONSTRAINT student_study_tasks_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 19. student_goals
ALTER TABLE IF EXISTS student_goals
DROP CONSTRAINT IF EXISTS student_goals_student_id_fkey;

ALTER TABLE IF EXISTS student_goals
ADD CONSTRAINT student_goals_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;

-- 20. student_goal_milestones
ALTER TABLE IF EXISTS student_goal_milestones
DROP CONSTRAINT IF EXISTS student_goal_milestones_student_id_fkey;

ALTER TABLE IF EXISTS student_goal_milestones
ADD CONSTRAINT student_goal_milestones_student_id_fkey
FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
