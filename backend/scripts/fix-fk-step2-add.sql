-- ============================================
-- STEP 2: ADD CORRECT FOREIGN KEY CONSTRAINTS
-- ============================================
-- Run this after step 1 to add correct constraints

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
