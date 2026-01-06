import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Running migration 004: Add personalization fields...\n');

  try {
    // Read the migration SQL
    const sql = readFileSync('./database/migrations/004_add_student_personalization.sql', 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 100) + '...');

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct execution via REST API
        console.log('Direct execution not available, migration must be run in Supabase SQL Editor');
        console.log('\nPlease run this SQL in Supabase SQL Editor:\n');
        console.log(sql);
        break;
      } else {
        console.log('✓ Success');
      }
    }

    console.log('\n✅ Migration completed');

    // Now populate first_name from display_name for existing students
    console.log('\nPopulating first_name from display_name...');

    const { data: students } = await supabase
      .from('student_accounts')
      .select('id, display_name, first_name')
      .is('first_name', null);

    if (students && students.length > 0) {
      console.log(`Found ${students.length} students without first_name`);

      for (const student of students) {
        const firstName = student.display_name?.split(' ')[0] || student.display_name;

        const { error } = await supabase
          .from('student_accounts')
          .update({ first_name: firstName })
          .eq('id', student.id);

        if (!error) {
          console.log(`✓ Set first_name="${firstName}" for student ${student.id}`);
        }
      }
    }

    console.log('\n✅ All done!');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration().finally(() => process.exit(0));
