import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function inspectSchema() {
  console.log('🔍 Inspecting table schemas...\n');

  // Use raw SQL to get column information
  const query = `
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_name IN ('student_goals', 'student_habits', 'student_notes')
    ORDER BY table_name, ordinal_position;
  `;

  try {
    // Try using RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { query });

    if (error) {
      console.log('RPC not available, trying alternative...\n');

      // Alternative: Try to insert with various column names to discover the schema
      const testTable = 'student_goals';

      console.log(`Testing ${testTable} table structure:\n`);

      // Test 1: Try with student_id
      const { error: e1 } = await supabase
        .from(testTable)
        .insert({
          student_id: '00000000-0000-0000-0000-000000000000',
          title: 'TEST'
        })
        .select();

      console.log('With student_id:', e1 ? `❌ ${e1.message}` : '✅ Success');

      // Test 2: Try with account_id
      const { error: e2 } = await supabase
        .from(testTable)
        .insert({
          account_id: '00000000-0000-0000-0000-000000000000',
          title: 'TEST'
        })
        .select();

      console.log('With account_id:', e2 ? `❌ ${e2.message}` : '✅ Success');

      // Test 3: Try without any id
      const { error: e3 } = await supabase
        .from(testTable)
        .insert({
          title: 'TEST',
          description: 'TEST',
          category: 'academic'
        })
        .select();

      console.log('Without foreign key:', e3 ? `❌ ${e3.message}` : '✅ Success');

      // Clean up any successful inserts
      await supabase.from(testTable).delete().eq('title', 'TEST');

    } else {
      console.log('Schema information:');
      console.log(data);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

inspectSchema();
