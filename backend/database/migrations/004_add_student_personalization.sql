-- ============================================================================
-- ADD PERSONALIZATION FIELDS TO STUDENT ACCOUNTS
-- ============================================================================
-- Adds first_name and grade_level for better personalization
-- ============================================================================

-- Add first_name column (separate from display_name for privacy)
ALTER TABLE student_accounts
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- Add grade_level column (more specific than study_level)
ALTER TABLE student_accounts
ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_accounts_first_name
ON student_accounts(first_name);

COMMENT ON COLUMN student_accounts.first_name IS 'Student first name for personalized greetings';
COMMENT ON COLUMN student_accounts.grade_level IS 'Student grade level (e.g., "Grade 8", "Year 10", "12th Grade")';
