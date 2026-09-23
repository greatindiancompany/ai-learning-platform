-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table (simplified - no user_id required)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT 'New Chat',
    folder VARCHAR(100) DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    was_flagged BOOLEAN DEFAULT false,
    moderation_reason TEXT,
    metadata JSONB
);

-- Create folders table (for organization)
CREATE TABLE IF NOT EXISTS chat_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT 'blue',
    icon VARCHAR(50) DEFAULT 'folder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX idx_conversations_session ON chat_conversations(session_id);
CREATE INDEX idx_conversations_updated ON chat_conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at);
CREATE INDEX idx_folders_session ON chat_folders(session_id);

-- Full-text search index
CREATE INDEX idx_messages_content_search ON chat_messages USING gin(to_tsvector('english', content));

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_conversations
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Row Level Security is on, with no policies for anon or authenticated.
-- The API uses the service role, which bypasses RLS, and checks ownership
-- in application code. The anon key cannot read or write these tables.
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_folders ENABLE ROW LEVEL SECURITY;
