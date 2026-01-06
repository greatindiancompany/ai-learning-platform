import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: student } = await supabase
  .from('student_accounts')
  .select('id, username, parent_id, display_name')
  .eq('username', 'demo1')
  .single();

console.log('=== DEMO1 INFO ===');
console.log('ID:', student.id);
console.log('Username:', student.username);
console.log('Display Name:', student.display_name);
console.log('Parent ID:', student.parent_id || 'NOT SET');

if (!student.parent_id) {
  console.log('\n❌ PROBLEM FOUND: demo1 has NO parent_id!');
  console.log('\nThe parent dashboard API (/api/parents/students/:id/memory)');
  console.log('requires students to have a parent_id set.');
  console.log('\nWithout a parent_id, the parent cannot see this student!');
} else {
  console.log('\n✅ demo1 has a parent_id, checking parent...');

  const { data: parent } = await supabase
    .from('parent_accounts')
    .select('id, email, name')
    .eq('id', student.parent_id)
    .single();

  if (parent) {
    console.log('Parent:', parent.email || parent.name);
  } else {
    console.log('⚠️  Parent ID exists but parent account not found!');
  }
}

process.exit(0);
