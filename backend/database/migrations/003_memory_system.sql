-- ============================================================================
-- INSPIR MEMORY SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Based on ChatGPT's 4-layer memory architecture
-- Adapted for student profiles in inspir
-- ============================================================================

-- ============================================================================
-- 1. STUDENT MEMORY FACTS TABLE
-- ============================================================================
-- Long-term facts about each student (preferences, goals, interests, etc.)

CREATE TABLE IF NOT EXISTS student_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,

  -- Memory content
  fact_type VARCHAR(50), -- 'preference', 'goal', 'interest', 'learning_style', 'strength', 'challenge'
  fact_text TEXT NOT NULL,

  -- Context
  learned_from_conversation_id UUID REFERENCES chat_conversations(id),
  learned_at TIMESTAMP DEFAULT NOW(),

  -- Status
  is_active BOOLEAN DEFAULT true,
  confidence_score FLOAT DEFAULT 1.0, -- How confident we are (0-1)

  -- Management
  added_by VARCHAR(50) DEFAULT 'auto', -- 'auto', 'parent', 'student'
  last_used_at TIMESTAMP,
  use_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for student_memory
CREATE INDEX IF NOT EXISTS idx_student_memory_student ON student_memory(student_id);
CREATE INDEX IF NOT EXISTS idx_student_memory_active ON student_memory(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_student_memory_type ON student_memory(student_id, fact_type);

-- ============================================================================
-- 2. CONVERSATION SUMMARIES TABLE
-- ============================================================================
-- Lightweight summaries of past conversations

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Summary data
  conversation_title VARCHAR(255),
  student_message_snippets TEXT[], -- Array of 3-5 key user messages
  topics_discussed TEXT[], -- ['physics', 'newton laws', 'homework help']

  -- Metadata
  message_count INTEGER,
  conversation_date TIMESTAMP,
  last_message_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for conversation_summaries
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_student ON conversation_summaries(student_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_date ON conversation_summaries(student_id, conversation_date DESC);

-- Function to cleanup old summaries (keep only last 20 per student)
CREATE OR REPLACE FUNCTION cleanup_old_summaries()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM conversation_summaries
  WHERE student_id = NEW.student_id
  AND id NOT IN (
    SELECT id FROM conversation_summaries
    WHERE student_id = NEW.student_id
    ORDER BY conversation_date DESC
    LIMIT 20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup old summaries
DROP TRIGGER IF EXISTS cleanup_conversation_summaries_trigger ON conversation_summaries;
CREATE TRIGGER cleanup_conversation_summaries_trigger
  AFTER INSERT ON conversation_summaries
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_summaries();

-- ============================================================================
-- 3. STUDENT SESSIONS TABLE
-- ============================================================================
-- Ephemeral session data (for analytics and context)

CREATE TABLE IF NOT EXISTS student_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Session info
  session_token VARCHAR(255) UNIQUE,
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,

  -- Device/Browser
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  browser VARCHAR(100),
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,

  -- Context
  time_of_day VARCHAR(20), -- 'morning', 'afternoon', 'evening', 'night'
  day_of_week VARCHAR(20),

  -- Activity metrics (computed)
  messages_sent INTEGER DEFAULT 0,
  tools_used TEXT[], -- ['flashcard', 'quiz', 'timer']
  session_duration_seconds INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for student_sessions
CREATE INDEX IF NOT EXISTS idx_student_sessions_student ON student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_sessions_token ON student_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_student_sessions_active ON student_sessions(student_id, ended_at) WHERE ended_at IS NULL;

-- ============================================================================
-- 4. STUDENT ANALYTICS TABLE
-- ============================================================================
-- Aggregated usage patterns (for session metadata context)

CREATE TABLE IF NOT EXISTS student_analytics (
  student_id UUID PRIMARY KEY REFERENCES student_accounts(id) ON DELETE CASCADE,

  -- Activity frequency
  active_days_last_7 INTEGER DEFAULT 0,
  active_days_last_30 INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,

  -- Conversation patterns
  avg_messages_per_session FLOAT DEFAULT 0,
  avg_message_length INTEGER DEFAULT 0,
  avg_session_duration_minutes INTEGER DEFAULT 0,

  -- Tool usage
  most_used_tools TEXT[], -- ['flashcard', 'quiz', 'chat']
  tool_usage_counts JSONB, -- {'flashcard': 45, 'quiz': 23, ...}

  -- Learning patterns
  preferred_subjects TEXT[], -- ['math', 'science', 'english']
  peak_usage_times TEXT[], -- ['afternoon', 'evening']

  -- Last updated
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for student_memory updated_at
DROP TRIGGER IF EXISTS update_student_memory_updated_at ON student_memory;
CREATE TRIGGER update_student_memory_updated_at
  BEFORE UPDATE ON student_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for student_analytics updated_at
DROP TRIGGER IF EXISTS update_student_analytics_updated_at ON student_analytics;
CREATE TRIGGER update_student_analytics_updated_at
  BEFORE UPDATE ON student_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create analytics record for all existing students
INSERT INTO student_analytics (student_id)
SELECT id FROM student_accounts
ON CONFLICT (student_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE student_memory IS 'Long-term memory facts about each student (preferences, goals, interests, strengths, challenges)';
COMMENT ON TABLE conversation_summaries IS 'Lightweight summaries of past conversations (keep last 20 per student)';
COMMENT ON TABLE student_sessions IS 'Session tracking data for analytics and contextual awareness';
COMMENT ON TABLE student_analytics IS 'Aggregated usage patterns and learning preferences';

COMMENT ON COLUMN student_memory.confidence_score IS 'How confident we are in this fact (0.0 to 1.0)';
COMMENT ON COLUMN student_memory.added_by IS 'How this memory was added: auto (AI detected), parent (parent added), student (explicitly stated)';
COMMENT ON COLUMN conversation_summaries.student_message_snippets IS 'Array of 3-5 key student messages from the conversation';
COMMENT ON COLUMN student_sessions.session_token IS 'Unique token to track this session across requests';
COMMENT ON COLUMN student_analytics.tool_usage_counts IS 'JSON object mapping tool names to usage counts';
