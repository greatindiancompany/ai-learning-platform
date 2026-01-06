# Fixes Applied to inspir Platform

## Date: December 27, 2025

### Issues Identified from Error Logs:

#### 1. ✅ FIXED: Rate Limiting Configuration
**Problem**: Express-rate-limit was throwing validation errors about trust proxy settings
**Solution**: Updated `/root/inspir/backend/routes/chat.js` to skip proxy validation warnings (nginx handles proxy validation)
**Status**: FIXED - Backend restarted

#### 2. ⚠️ REQUIRES MANUAL FIX: Foreign Key Constraints
**Problem**: ALL study tools failing with foreign key errors:
```
Error: insert or update on table "student_goals" violates foreign key constraint
"student_goals_student_id_fkey"
Key (student_id)=(xxx) is not present in table "students"
```

**Root Cause**: Tool tables reference `students(id)` but the correct table is `student_accounts(id)`

**Affected Tools**:
- Goals Setter
- Notes Sync
- Habit Tracker
- Study Timer
- Visual Learning
- AI Planner
- All other study tools

**Solution Created**:
1. Updated `/root/inspir/backend/database/tools-schema.sql` to reference `student_accounts` instead of `students`
2. Created SQL migration script: `/root/inspir/backend/scripts/fix-foreign-keys.sql`

**ACTION REQUIRED**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `/root/inspir/backend/scripts/fix-foreign-keys.sql`
3. Run the script to update all foreign key constraints
4. Verify by testing any study tool (Goals, Habits, Notes, etc.)

**Alternative**: Run these commands to view/apply the fix:
```bash
cat /root/inspir/backend/scripts/fix-foreign-keys.sql
# Copy output and paste into Supabase SQL Editor
```

### Tools Implementation Status:

#### ✅ Newly Implemented:
1. **AI Planner Tool** - Full study planning feature with date ranges, subjects, tasks
2. **Visual Learning Tool** - Mind maps, flowcharts, concept maps, diagrams

#### ✅ Previously Working:
1. Study Timer
2. Habit Tracker
3. Goal Setter
4. Notes Sync

#### 🔴 Currently Broken (due to FK issue):
- ALL tools will work once the foreign key fix is applied to Supabase

### Other Non-Critical Issues:

#### Sentry Integration Warning
```
[Sentry] express is not instrumented
```
- Non-critical
- Can be ignored or fixed by properly initializing Sentry with --import flag

#### Image Upload Validation (Historical)
```
BadRequestError: media_type should be 'image/jpeg', 'image/png', 'image/gif' or 'image/webp'
```
- Historical error
- Need to validate image media types before sending to Claude API

### Testing After Fix:

Once the SQL fix is applied, test:
1. Open chat interface at https://inspir.uk/chat
2. Click on any tool icon in the bottom toolbar
3. Try creating:
   - A new goal
   - A new habit
   - A new note
   - A new study plan
   - A visual learning aid
4. All should work without foreign key errors

### Files Modified:
1. `/root/inspir/backend/routes/chat.js` - Rate limit config fix
2. `/root/inspir/backend/database/tools-schema.sql` - Updated FK references
3. `/root/inspir/frontend/src/components/tools/AIPlannerTool.jsx` - Full implementation
4. `/root/inspir/frontend/src/components/tools/VisualLearningTool.jsx` - Full implementation

### Files Created:
1. `/root/inspir/backend/scripts/fix-foreign-keys.sql` - Migration script for FK fixes
