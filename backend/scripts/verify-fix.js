import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFix() {
  console.log('🔍 Verifying database fixes...\n');

  // Get a real student ID from student_accounts
  const { data: accounts } = await supabase
    .from('student_accounts')
    .select('id, username, display_name')
    .limit(1)
    .single();

  if (!accounts) {
    console.log('❌ No student accounts found');
    return;
  }

  const studentId = accounts.id;
  console.log(`📋 Using test student: ${accounts.username} (${accounts.display_name})`);
  console.log(`   ID: ${studentId}\n`);

  const tests = [
    {
      name: 'Goals',
      table: 'student_goals',
      data: { student_id: studentId, title: 'VERIFY TEST', description: 'Test', category: 'academic' }
    },
    {
      name: 'Habits',
      table: 'student_habits',
      data: { student_id: studentId, name: 'VERIFY TEST', frequency: 'daily', target_count: 1 }
    },
    {
      name: 'Notes',
      table: 'student_notes',
      data: { student_id: studentId, title: 'VERIFY TEST', subject: 'Test' }
    },
    {
      name: 'Study Sessions',
      table: 'student_study_sessions',
      data: { student_id: studentId, task_name: 'VERIFY TEST', duration_minutes: 25 }
    },
    {
      name: 'Visual Learning',
      table: 'student_visual_learning',
      data: { student_id: studentId, title: 'VERIFY TEST', type: 'mind-map', content: 'Test' }
    },
    {
      name: 'Study Plans',
      table: 'student_study_plans',
      data: {
        student_id: studentId,
        title: 'VERIFY TEST',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        schedule: {}
      }
    }
  ];

  let passCount = 0;
  let failCount = 0;

  console.log('Testing tool database operations:\n');

  for (const test of tests) {
    try {
      // Try to insert
      const { data: insertData, error: insertError } = await supabase
        .from(test.table)
        .insert(test.data)
        .select()
        .single();

      if (insertError) {
        console.log(`❌ ${test.name}: ${insertError.message}`);
        failCount++;
      } else {
        console.log(`✅ ${test.name}: Insert successful`);

        // Clean up test data
        await supabase.from(test.table).delete().eq('id', insertData.id);
        passCount++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);

  if (failCount === 0) {
    console.log(`\n🎉 SUCCESS! All tools are working correctly!`);
    console.log(`\n✨ You can now use all study tools at https://inspir.uk/chat`);
    console.log(`   - Goals Setter 🎯`);
    console.log(`   - Habit Tracker ✅`);
    console.log(`   - Notes Sync 📓`);
    console.log(`   - Study Timer ⏰`);
    console.log(`   - Visual Learning 🌍`);
    console.log(`   - AI Planner 📅`);
    console.log(`   - And more!`);
  } else {
    console.log(`\n⚠️  Some tools still have issues. Check the errors above.`);
  }
}

verifyFix();
