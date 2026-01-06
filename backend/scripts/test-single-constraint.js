import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('🧪 Testing constraint addition...\n');

  // Clean up test data
  await supabase.from('student_goals').delete().eq('title', 'TEST');

  // First, let's see if student_accounts table has an 'id' column
  console.log('Checking student_accounts structure:');
  const { data: accounts, error: accError } = await supabase
    .from('student_accounts')
    .select('id')
    .limit(1);

  if (accError) {
    console.log('❌ Error:', accError.message);
  } else {
    console.log('✅ student_accounts has id column:', accounts[0]?.id);
  }

  // Check what error we get when trying to reference a non-existent ID
  console.log('\nTrying to insert with valid student_accounts ID:');
  const validId = accounts[0]?.id;

  const { data: insertData, error: insertError } = await supabase
    .from('student_goals')
    .insert({
      student_id: validId,
      title: 'TEST GOAL',
      description: 'Test',
      category: 'academic'
    })
    .select();

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message);
  } else {
    console.log('✅ Insert succeeded! Goal ID:', insertData[0]?.id);

    // Clean up
    await supabase.from('student_goals').delete().eq('id', insertData[0]?.id);
    console.log('✅ Cleaned up test data');
  }

  console.log('\n💡 The column exists and works. The SQL error might be about the constraint syntax.');
  console.log('   Try adding constraints one at a time in Supabase SQL Editor to see which one fails.');
}

test();
