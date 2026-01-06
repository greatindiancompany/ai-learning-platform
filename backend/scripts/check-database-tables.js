import { supabase } from '../utils/supabaseClient.js';

async function checkTables() {
  console.log('🔍 Checking database structure...\n');

  const toolTables = [
    'student_accounts',
    'parent_accounts',
    'student_sketches',
    'student_quizzes',
    'student_flashcard_decks',
    'student_practice_tests',
    'student_study_sessions',
    'student_habits',
    'student_music_playlists',
    'student_image_analyses',
    'student_math_problems',
    'student_science_experiments',
    'student_visual_learning',
    'student_notes',
    'student_study_plans',
    'student_goals'
  ];

  for (const table of toolTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('does not exist')) {
          console.log(`❌ ${table}: Does not exist`);
        } else {
          console.log(`⚠️  ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n📊 Checking table structures...\n');

  // Check student_goals structure specifically
  const { data: goalsData, error: goalsError } = await supabase
    .from('student_goals')
    .select('*')
    .limit(0);

  if (!goalsError) {
    console.log('✅ student_goals table exists and is accessible');
  } else {
    console.log('❌ student_goals error:', goalsError.message);
  }
}

checkTables().catch(console.error);
