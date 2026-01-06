-- ============================================
-- SAFE VERSION: Add constraints only to existing tables
-- ============================================
-- Run this in Supabase SQL Editor
-- This version checks each table individually

-- Core tool tables (definitely exist)
DO $$
BEGIN
    -- student_goals
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_goals') THEN
        ALTER TABLE student_goals ADD CONSTRAINT student_goals_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_goals';
    END IF;

    -- student_habits
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_habits') THEN
        ALTER TABLE student_habits ADD CONSTRAINT student_habits_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_habits';
    END IF;

    -- student_notes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_notes') THEN
        ALTER TABLE student_notes ADD CONSTRAINT student_notes_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_notes';
    END IF;

    -- student_study_sessions
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_study_sessions') THEN
        ALTER TABLE student_study_sessions ADD CONSTRAINT student_study_sessions_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_study_sessions';
    END IF;

    -- student_visual_learning
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_visual_learning') THEN
        ALTER TABLE student_visual_learning ADD CONSTRAINT student_visual_learning_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_visual_learning';
    END IF;

    -- student_study_plans
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_study_plans') THEN
        ALTER TABLE student_study_plans ADD CONSTRAINT student_study_plans_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_study_plans';
    END IF;

    -- student_study_tasks (might reference study_plans)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_study_tasks') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'student_study_tasks' AND column_name = 'student_id') THEN
            ALTER TABLE student_study_tasks ADD CONSTRAINT student_study_tasks_student_id_fkey
            FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added constraint to student_study_tasks';
        END IF;
    END IF;

    -- Additional tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_sketches') THEN
        ALTER TABLE student_sketches ADD CONSTRAINT student_sketches_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_sketches';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_quizzes') THEN
        ALTER TABLE student_quizzes ADD CONSTRAINT student_quizzes_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_quizzes';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_flashcard_decks') THEN
        ALTER TABLE student_flashcard_decks ADD CONSTRAINT student_flashcard_decks_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_flashcard_decks';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_practice_tests') THEN
        ALTER TABLE student_practice_tests ADD CONSTRAINT student_practice_tests_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_practice_tests';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_music_playlists') THEN
        ALTER TABLE student_music_playlists ADD CONSTRAINT student_music_playlists_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_music_playlists';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_image_analyses') THEN
        ALTER TABLE student_image_analyses ADD CONSTRAINT student_image_analyses_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_image_analyses';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_math_problems') THEN
        ALTER TABLE student_math_problems ADD CONSTRAINT student_math_problems_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_math_problems';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_science_experiments') THEN
        ALTER TABLE student_science_experiments ADD CONSTRAINT student_science_experiments_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added constraint to student_science_experiments';
    END IF;

    -- Related tables (attempts, completions, etc.)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_quiz_attempts') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'student_quiz_attempts' AND column_name = 'student_id') THEN
            ALTER TABLE student_quiz_attempts ADD CONSTRAINT student_quiz_attempts_student_id_fkey
            FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added constraint to student_quiz_attempts';
        END IF;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_habit_completions') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'student_habit_completions' AND column_name = 'student_id') THEN
            ALTER TABLE student_habit_completions ADD CONSTRAINT student_habit_completions_student_id_fkey
            FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added constraint to student_habit_completions';
        END IF;
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_goal_milestones') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'student_goal_milestones' AND column_name = 'student_id') THEN
            ALTER TABLE student_goal_milestones ADD CONSTRAINT student_goal_milestones_student_id_fkey
            FOREIGN KEY (student_id) REFERENCES student_accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added constraint to student_goal_milestones';
        END IF;
    END IF;

END $$;
