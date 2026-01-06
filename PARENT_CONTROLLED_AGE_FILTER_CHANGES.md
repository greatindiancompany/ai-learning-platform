# Parent-Controlled Age Filter Implementation
## Code Changes Documentation
**Date:** 2025-12-27
**Purpose:** Lock age filter/content moderation mode to parent settings - students cannot override

---

## Summary of Changes

Students' content moderation level (age filter) is now determined by parents and stored in the `student_accounts.age_group` field. Students can see their assigned mode but cannot change it. The age filter dropdown is now display-only with a lock icon for authenticated students.

---

## Backend Changes

### 1. `/root/inspir/backend/controllers/chatController.js`

**Line 123-154:** Modified `sendMessage` function to fetch age_group from student profile

**BEFORE:**
```javascript
// SEND message with SSE streaming
export const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const {
      content,
      ageFilter = 'teen',
      isRegeneration = false,
      previousResponseId = null
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Content moderation check
    const moderationResult = contentModeration.shouldBlock(content, ageFilter);
```

**AFTER:**
```javascript
// SEND message with SSE streaming
export const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const {
      content,
      isRegeneration = false,
      previousResponseId = null
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Determine age filter - if authenticated, use student's age_group from profile
    // Parents set this and students cannot override it
    let ageFilter = 'teen'; // Default for non-authenticated users

    if (req.student_id) {
      const { data: student, error: studentError } = await supabase
        .from('student_accounts')
        .select('age_group')
        .eq('id', req.student_id)
        .single();

      if (!studentError && student && student.age_group) {
        ageFilter = student.age_group; // Use parent-assigned age group
      }
    }

    // Content moderation check
    const moderationResult = contentModeration.shouldBlock(content, ageFilter);
```

**Impact:** Backend now fetches age_group from student's profile instead of accepting it from request body. This prevents students from overriding their parent-assigned content moderation level.

---

### 2. `/root/inspir/backend/routes/tools.js`

**Line 3:** Fixed import path for authentication middleware

**BEFORE:**
```javascript
import { authenticateToken } from '../middleware/auth.js';
```

**AFTER:**
```javascript
import { authenticateStudent } from '../middleware/authMiddleware.js';
```

**Line 8:** Updated middleware function name

**BEFORE:**
```javascript
router.use(authenticateToken);
```

**AFTER:**
```javascript
router.use(authenticateStudent);
```

**Impact:** Fixed module import error that was causing backend to crash on startup.

---

### 3. `/root/inspir/backend/controllers/toolsController.js`

**Line 1:** Fixed import for supabase client

**BEFORE:**
```javascript
import supabase from '../utils/supabaseClient.js';
```

**AFTER:**
```javascript
import { supabase } from '../utils/supabaseClient.js';
```

**Multiple lines:** Fixed student_id extraction from request

**BEFORE (repeated throughout file):**
```javascript
const { student_id } = req.user;
```

**AFTER (all occurrences):**
```javascript
const student_id = req.student_id;
```

**Impact:** Fixed module import error and aligned with authentication middleware pattern.

---

## Frontend Changes

### 4. `/root/inspir/frontend/src/components/chat/ChatHeader.jsx`

**Line 14-22:** Added `isAuthenticated` prop to component signature

**BEFORE:**
```javascript
export default function ChatHeader({
  currentSubject,
  ageFilter,
  studyStreak,
  todayStudyTime,
  onSubjectChange,
  onAgeFilterChange
}) {
```

**AFTER:**
```javascript
export default function ChatHeader({
  currentSubject,
  ageFilter,
  studyStreak,
  todayStudyTime,
  onSubjectChange,
  onAgeFilterChange,
  isAuthenticated = false
}) {
```

**Line 94-125:** Changed age filter from dropdown to display-only badge for authenticated users

**BEFORE:**
```javascript
          {/* Age Filter */}
          <div className="relative">
            <select
              value={ageFilter}
              onChange={(e) => onAgeFilterChange(e.target.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 border ${
                ageFilters.find(f => f.value === ageFilter)?.color
              }`}
            >
              {ageFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.emoji} {filter.label}
                </option>
              ))}
            </select>
          </div>
```

**AFTER:**
```javascript
          {/* Age Filter - Display only for authenticated students (set by parents) */}
          <div className="relative">
            {isAuthenticated ? (
              <motion.div
                className={`px-4 py-2 rounded-lg font-medium text-sm border ${
                  ageFilters.find(f => f.value === ageFilter)?.color
                }`}
                title="Content mode set by your parent - cannot be changed"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <span>{ageFilters.find(f => f.value === ageFilter)?.emoji}</span>
                  <span>{ageFilters.find(f => f.value === ageFilter)?.label}</span>
                  <span className="text-xs opacity-60">🔒</span>
                </div>
              </motion.div>
            ) : (
              <select
                value={ageFilter}
                onChange={(e) => onAgeFilterChange(e.target.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 border ${
                  ageFilters.find(f => f.value === ageFilter)?.color
                }`}
              >
                {ageFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.emoji} {filter.label}
                  </option>
                ))}
              </select>
            )}
          </div>
```

**Impact:** Authenticated students see a locked badge showing their content mode instead of a changeable dropdown. Tooltip explains it's set by parents.

---

### 5. `/root/inspir/frontend/src/pages/Chat.jsx`

**Line 5:** Added imports for authentication utilities

**BEFORE:**
```javascript
import { getToken } from '../utils/auth';
```

**AFTER:**
```javascript
import { getToken, getStudentData, isAuthenticated } from '../utils/auth';
```

**Line 61-71:** Load student's age_group from localStorage on mount

**BEFORE:**
```javascript
  // Load conversations and stats on mount
  useEffect(() => {
    loadConversations();
    loadStudentStats();
  }, []);
```

**AFTER:**
```javascript
  // Load conversations and stats on mount
  useEffect(() => {
    loadConversations();
    loadStudentStats();

    // Load student's age_group from localStorage (set by parents, cannot be overridden)
    const studentData = getStudentData();
    if (studentData && studentData.age_group) {
      setAgeFilter(studentData.age_group);
    }
  }, []);
```

**Line 187-192:** Removed ageFilter from message request body

**BEFORE:**
```javascript
    try {
      // Prepare request body
      const requestBody = {
        content: userMessage,
        ageFilter
      };

      // Get auth token if available
```

**AFTER:**
```javascript
    try {
      // Prepare request body
      // Note: ageFilter is determined by backend from student's profile (set by parents)
      const requestBody = {
        content: userMessage
      };

      // Get auth token if available
```

**Line 370-394:** Updated regenerateResponse to remove ageFilter and add auth header

**BEFORE:**
```javascript
      setIsStreaming(true);
      setStreamingMessage('');
      setContentPolicyError(null); // Clear any previous errors

      const response = await fetch(
        `${API_URL}/chat/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: lastUserMessage.content,
            ageFilter,
            isRegeneration: true,
            previousResponseId: messageId
          })
        }
      );
```

**AFTER:**
```javascript
      setIsStreaming(true);
      setStreamingMessage('');
      setContentPolicyError(null); // Clear any previous errors

      // Get auth token if available
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/chat/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: lastUserMessage.content,
            isRegeneration: true,
            previousResponseId: messageId
          })
        }
      );
```

**Line 494-502:** Pass isAuthenticated prop to ChatHeader

**BEFORE:**
```javascript
        <ChatHeader
          currentSubject={currentSubject}
          ageFilter={ageFilter}
          studyStreak={studyStreak}
          todayStudyTime={todayStudyTime}
          onSubjectChange={setCurrentSubject}
          onAgeFilterChange={setAgeFilter}
        />
```

**AFTER:**
```javascript
        <ChatHeader
          currentSubject={currentSubject}
          ageFilter={ageFilter}
          studyStreak={studyStreak}
          todayStudyTime={todayStudyTime}
          onSubjectChange={setCurrentSubject}
          onAgeFilterChange={setAgeFilter}
          isAuthenticated={isAuthenticated()}
        />
```

**Impact:** Frontend now loads age_group from student profile data and doesn't send it in requests. The ChatHeader displays locked mode for authenticated students.

---

## How It Works

### Parent Sets Age Group
When parents create a student account via the dashboard, they set the `age_group` field:
- `under14` - Strictest content filtering
- `teen` - Moderate filtering (default)
- `adult` - Minimal filtering

### Student Login
1. Student logs in with username/password
2. Backend returns student data including `age_group` in response
3. Frontend stores this in localStorage via `saveStudentData()`

### Content Moderation
1. Student sends a message
2. Backend checks if student is authenticated (`req.student_id` exists)
3. If authenticated, backend queries `student_accounts` table for their `age_group`
4. Backend uses this `age_group` for content moderation
5. Frontend displays the locked mode badge in header

### Student Cannot Override
- Frontend doesn't send `ageFilter` in request body
- Backend ignores any `ageFilter` parameter if student is authenticated
- UI shows lock icon 🔒 and tooltip explaining parent control
- Non-authenticated users (session-based) can still select age filter

---

## Testing Checklist

- [ ] Student login returns `age_group` in response
- [ ] Chat header shows locked badge for authenticated students
- [ ] Hovering over badge shows tooltip "Content mode set by your parent - cannot be changed"
- [ ] Messages use correct content moderation based on student's `age_group`
- [ ] Non-authenticated users still see age filter dropdown
- [ ] Backend correctly fetches `age_group` from student profile
- [ ] Students with different age groups get different content moderation levels

---

## Database Requirements

The `student_accounts` table must have an `age_group` column:
- Type: `text` or `enum('under14', 'teen', 'adult')`
- Default: `'teen'`
- Set by parents, not students
- Used by backend for content moderation

---

## Files Modified

1. `/root/inspir/backend/controllers/chatController.js`
2. `/root/inspir/backend/routes/tools.js`
3. `/root/inspir/backend/controllers/toolsController.js`
4. `/root/inspir/frontend/src/components/chat/ChatHeader.jsx`
5. `/root/inspir/frontend/src/pages/Chat.jsx`

---

## Deployment Notes

**IMPORTANT:** These changes have NOT been built or deployed yet. To deploy:

```bash
# Build React frontend
cd /root/inspir/frontend
npm run build

# Restart backend (PM2)
pm2 restart inspir-backend

# Verify services
pm2 status
curl https://inspir.uk/api/health
curl https://inspir.uk/chat
```

---

## Rollback Instructions

If these changes need to be reverted, restore the following from git:

```bash
cd /root/inspir
git checkout HEAD -- backend/controllers/chatController.js
git checkout HEAD -- backend/routes/tools.js
git checkout HEAD -- backend/controllers/toolsController.js
git checkout HEAD -- frontend/src/components/chat/ChatHeader.jsx
git checkout HEAD -- frontend/src/pages/Chat.jsx
```

Or revert to commit: `356fc5b` (Fix API URLs - remove double /api/ path)
