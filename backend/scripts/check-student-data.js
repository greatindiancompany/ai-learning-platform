import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Checking student data...\n');

  // Get all students
  const { data: students, error: studentsError } = await supabase
    .from('student_accounts')
    .select('id, username, display_name, study_level, age_group')
    .order('created_at', { ascending: false })
    .limit(10);

  if (studentsError) {
    console.error('Error fetching students:', studentsError);
    return;
  }

  if (!students || students.length === 0) {
    console.log('No students found in database');
    return;
  }

  console.log('=== STUDENTS ===');
  for (const student of students) {
    console.log(`\nStudent ID: ${student.id}`);
    console.log(`  Username: ${student.username}`);
    console.log(`  Display Name: ${student.display_name || 'NOT SET'}`);
    console.log(`  Study Level: ${student.study_level || 'NOT SET'}`);
    console.log(`  Age Group: ${student.age_group}`);

    // Check conversations for this student
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('id, title')
      .eq('student_id', student.id)
      .limit(3);

    console.log(`  Conversations: ${conversations?.length || 0}`);

    // Check memory facts
    const { data: memory } = await supabase
      .from('student_memory')
      .select('id, fact_type, fact_text')
      .eq('student_id', student.id)
      .eq('is_active', true);

    console.log(`  Memory Facts: ${memory?.length || 0}`);

    if (memory && memory.length > 0) {
      memory.forEach(m => {
        console.log(`    - [${m.fact_type}] ${m.fact_text.substring(0, 60)}...`);
      });
    }
  }
}

check()
  .catch(console.error)
  .finally(() => process.exit(0));
