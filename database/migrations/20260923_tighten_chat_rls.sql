-- Drop the public chat policies. Apply this in the Supabase SQL editor.
-- The API uses the service role, which bypasses RLS, and checks ownership
-- before it reads or writes. Anon and authenticated roles then have no policy,
-- so direct PostgREST access to chat rows is denied.
-- This file does not grant any new access and does not contain credentials.

DROP POLICY IF EXISTS "Allow all operations on conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Allow all operations on messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations on folders" ON chat_folders;

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_folders ENABLE ROW LEVEL SECURITY;
