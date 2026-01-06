-- ============================================
-- INSPIR STUDY TOOLS DATABASE SCHEMA
-- ============================================
-- All tools data tied to student_id (references student_accounts table)
-- Each tool has its own table(s) for data persistence

-- ============================================
-- 1. DRAW/SKETCH TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  canvas_data JSONB NOT NULL, -- Stores drawing data
  thumbnail_url TEXT, -- Optional thumbnail for preview
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sketches_student ON student_sketches(student_id);
CREATE INDEX idx_sketches_created ON student_sketches(created_at DESC);

-- ============================================
-- 2. QUIZ GENERATOR TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions JSONB NOT NULL, -- Array of {question, options[], correctAnswer, explanation}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES student_quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL, -- User's answers
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_student ON student_quizzes(student_id);
CREATE INDEX idx_quiz_attempts_student ON student_quiz_attempts(student_id);

-- ============================================
-- 3. FLASHCARDS TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES student_flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcard_decks_student ON student_flashcard_decks(student_id);
CREATE INDEX idx_flashcards_deck ON student_flashcards(deck_id);

-- ============================================
-- 4. PRACTICE TESTS TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_practice_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  duration_minutes INTEGER, -- Time limit
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES student_practice_tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_tests_student ON student_practice_tests(student_id);
CREATE INDEX idx_test_attempts_student ON student_test_attempts(student_id);

-- ============================================
-- 5. STUDY TIMER TOOL (Pomodoro)
-- ============================================
CREATE TABLE IF NOT EXISTS student_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  task_name VARCHAR(255),
  subject VARCHAR(100),
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_study_sessions_student ON student_study_sessions(student_id);
CREATE INDEX idx_study_sessions_date ON student_study_sessions(started_at DESC);

-- ============================================
-- 6. HABIT TRACKER TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly
  target_count INTEGER DEFAULT 1, -- Times per day/week
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES student_habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_habits_student ON student_habits(student_id);
CREATE INDEX idx_habit_completions_habit ON student_habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON student_habit_completions(completed_at DESC);

-- ============================================
-- 7. EXPLAIN CONCEPT TOOL
-- No database needed - just prompts Claude differently
-- ============================================

-- ============================================
-- 8. STUDY MUSIC TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(100), -- lofi, classical, nature, binaural
  tracks JSONB, -- Array of track URLs/IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_music_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  track_name VARCHAR(255),
  genre VARCHAR(100),
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_music_playlists_student ON student_music_playlists(student_id);
CREATE INDEX idx_music_history_student ON student_music_history(student_id);

-- ============================================
-- 9. IMAGE ANALYSIS TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_image_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_result TEXT, -- Claude's analysis
  subject VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_image_analyses_student ON student_image_analyses(student_id);

-- ============================================
-- 10. MATH SOLVER TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_math_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  solution JSONB, -- {steps: [], finalAnswer: ""}
  topic VARCHAR(100), -- algebra, calculus, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_math_problems_student ON student_math_problems(student_id);

-- ============================================
-- 11. SCIENCE LAB TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100), -- chemistry, physics, biology
  experiment_type VARCHAR(100),
  data JSONB, -- Experiment parameters and results
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_experiments_student ON student_experiments(student_id);

-- ============================================
-- 12. VISUAL LEARNING TOOL (Mind Maps, Diagrams)
-- ============================================
CREATE TABLE IF NOT EXISTS student_visual_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- mindmap, flowchart, diagram, map
  content JSONB NOT NULL, -- Visual data structure
  subject VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visual_learning_student ON student_visual_learning(student_id);

-- ============================================
-- 13. NOTES SYNC TOOL (Cornell Notes)
-- ============================================
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  cue_column TEXT, -- Left column: key points/questions
  notes_column TEXT, -- Right column: detailed notes
  summary TEXT, -- Bottom: summary
  source VARCHAR(255), -- From chat, manual, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_student ON student_notes(student_id);
CREATE INDEX idx_notes_subject ON student_notes(subject);

-- ============================================
-- 14. AI PLANNER TOOL (Study Schedule)
-- ============================================
CREATE TABLE IF NOT EXISTS student_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  subjects JSONB, -- Array of subjects
  schedule JSONB NOT NULL, -- Generated schedule
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES student_study_plans(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_plans_student ON student_study_plans(student_id);
CREATE INDEX idx_study_tasks_student ON student_study_tasks(student_id);
CREATE INDEX idx_study_tasks_due ON student_study_tasks(due_date);

-- ============================================
-- 15. GOAL SETTER TOOL
-- ============================================
CREATE TABLE IF NOT EXISTS student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- academic, personal, skill
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES student_goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_student ON student_goals(student_id);
CREATE INDEX idx_goal_milestones_goal ON student_goal_milestones(goal_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Sketches
CREATE OR REPLACE FUNCTION update_sketch_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sketch_timestamp
BEFORE UPDATE ON student_sketches
FOR EACH ROW EXECUTE FUNCTION update_sketch_timestamp();

-- Flashcard Decks
CREATE TRIGGER trigger_update_flashcard_deck_timestamp
BEFORE UPDATE ON student_flashcard_decks
FOR EACH ROW EXECUTE FUNCTION update_sketch_timestamp();

-- Visual Learning
CREATE TRIGGER trigger_update_visual_learning_timestamp
BEFORE UPDATE ON student_visual_learning
FOR EACH ROW EXECUTE FUNCTION update_sketch_timestamp();

-- Notes
CREATE TRIGGER trigger_update_notes_timestamp
BEFORE UPDATE ON student_notes
FOR EACH ROW EXECUTE FUNCTION update_sketch_timestamp();

-- Goals
CREATE TRIGGER trigger_update_goals_timestamp
BEFORE UPDATE ON student_goals
FOR EACH ROW EXECUTE FUNCTION update_sketch_timestamp();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Study time summary by student
CREATE OR REPLACE VIEW student_study_time_summary AS
SELECT
  student_id,
  COUNT(*) as total_sessions,
  SUM(duration_minutes) as total_minutes,
  AVG(duration_minutes) as avg_session_minutes,
  DATE(started_at) as study_date
FROM student_study_sessions
WHERE completed = true
GROUP BY student_id, DATE(started_at);

-- Habit streak calculation
CREATE OR REPLACE VIEW student_habit_streaks AS
SELECT
  h.id as habit_id,
  h.student_id,
  h.name as habit_name,
  COUNT(DISTINCT DATE(hc.completed_at)) as completion_count,
  MAX(DATE(hc.completed_at)) as last_completion
FROM student_habits h
LEFT JOIN student_habit_completions hc ON h.id = hc.habit_id
WHERE hc.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY h.id, h.student_id, h.name;

-- Goal progress summary
CREATE OR REPLACE VIEW student_goal_progress AS
SELECT
  g.id as goal_id,
  g.student_id,
  g.title,
  g.progress,
  COUNT(m.id) as total_milestones,
  COUNT(CASE WHEN m.completed THEN 1 END) as completed_milestones
FROM student_goals g
LEFT JOIN student_goal_milestones m ON g.id = m.goal_id
GROUP BY g.id, g.student_id, g.title, g.progress;
