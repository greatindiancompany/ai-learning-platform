import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function describeTables() {
  console.log('🔍 Checking table structures...\n');

  const tables = ['student_goals', 'student_habits', 'student_notes', 'student_visual_learning', 'student_study_plans'];

  for (const table of tables) {
    console.log(`\n=== ${table} ===`);

    // Try to select with limit 0 to see columns without data
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Error: ${error.message}`);
    } else {
      if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
      } else {
        // Table empty, but we can see from error what columns it expects
        // Try inserting empty object to see required fields
        const { error: insertError } = await supabase
          .from(table)
          .insert({});

        if (insertError) {
          console.log('Required fields from error:', insertError.message);
        }
      }
    }
  }

  // Check if there's a students table
  console.log('\n\n=== Checking for students table ===');
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .limit(1);

  if (studentsError) {
    console.log('❌ students table:', studentsError.message);
  } else {
    console.log('✅ students table exists with', studentsData.length, 'records');
  }
}

describeTables();
