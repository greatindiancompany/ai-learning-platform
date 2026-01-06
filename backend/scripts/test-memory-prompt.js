import { createClient } from '@supabase/supabase-js';
import memoryService from '../services/memoryService.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const studentId = '469e65e5-333e-41d9-b67e-ef1b561deceb';

  console.log('Testing memory prompt generation for demo1...\n');

  // Get memory context
  const memoryContext = await memoryService.getStudentMemoryContext(studentId, null);

  // Get student data
  const { data: studentData } = await supabase
    .from('student_accounts')
    .select('age_group, display_name, study_level')
    .eq('id', studentId)
    .single();

  console.log('Student Data:', studentData);
  console.log('\nMemory Facts Count:', memoryContext.memoryFacts?.length || 0);
  console.log('\n=== FULL SYSTEM PROMPT ===\n');

  // Generate the prompt
  const memoryPrompt = memoryService.formatMemoryForPrompt(memoryContext, studentData);

  console.log(memoryPrompt);
  console.log('\n=== END PROMPT ===\n');
}

test().catch(console.error).finally(() => process.exit(0));
