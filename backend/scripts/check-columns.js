import { supabase } from '../utils/supabaseClient.js';

async function checkColumns() {
  console.log('🔍 Checking table columns...\n');

  // Try to insert a test record to see what columns are required
  const testStudentId = '00000000-0000-0000-0000-000000000000';

  const tables = [
    { name: 'student_goals', testData: { title: 'TEST', description: 'TEST' } },
    { name: 'student_habits', testData: { name: 'TEST', frequency: 'daily' } },
    { name: 'student_notes', testData: { title: 'TEST', subject: 'TEST' } }
  ];

  for (const { name, testData } of tables) {
    console.log(`\n--- ${name} ---`);

    // Try with student_id
    const { data: data1, error: error1 } = await supabase
      .from(name)
      .insert({ ...testData, student_id: testStudentId })
      .select();

    if (error1) {
      console.log(`❌ With student_id: ${error1.message}`);
      console.log(`   Code: ${error1.code}`);

      // Check if it mentions a different column name
      if (error1.message.includes('account_id')) {
        console.log('💡 Table might use account_id instead of student_id');
      }
    } else {
      console.log(`✅ With student_id: Success`);
      // Clean up test data
      await supabase.from(name).delete().eq('title', 'TEST');
    }
  }
}

checkColumns().catch(console.error);
