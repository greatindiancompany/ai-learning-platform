import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStudentsTables() {
  console.log('🔍 Comparing students vs student_accounts tables...\n');

  // Check students table
  console.log('=== students table ===');
  const { data: studentsData, error: studentsError, count: studentsCount } = await supabase
    .from('students')
    .select('*', { count: 'exact' });

  if (studentsError) {
    console.log('❌ Error:', studentsError.message);
  } else {
    console.log(`✅ Found ${studentsCount} records`);
    if (studentsData && studentsData.length > 0) {
      console.log('Sample record columns:', Object.keys(studentsData[0]).join(', '));
    }
  }

  // Check student_accounts table
  console.log('\n=== student_accounts table ===');
  const { data: accountsData, error: accountsError, count: accountsCount } = await supabase
    .from('student_accounts')
    .select('id, username, display_name', { count: 'exact' });

  if (accountsError) {
    console.log('❌ Error:', accountsError.message);
  } else {
    console.log(`✅ Found ${accountsCount} records`);
    console.log('\nStudent accounts:');
    accountsData.forEach(acc => {
      console.log(`  - ${acc.username} (${acc.display_name}) [ID: ${acc.id}]`);
    });
  }

  console.log('\n💡 Solution: Copy data from student_accounts to students table');
}

checkStudentsTables();
