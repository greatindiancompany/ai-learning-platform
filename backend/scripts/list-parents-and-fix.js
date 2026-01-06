import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('=== LISTING ALL PARENT ACCOUNTS ===\n');

const { data: parents } = await supabase
  .from('parent_accounts')
  .select('id, email, name, username')
  .order('created_at', { ascending: false })
  .limit(10);

if (!parents || parents.length === 0) {
  console.log('❌ NO PARENT ACCOUNTS FOUND!\n');
  console.log('You need to create a parent account first.');
  console.log('Go to: https://inspir.uk/signup');
} else {
  console.log(`Found ${parents.length} parent account(s):\n`);
  parents.forEach((p, i) => {
    console.log(`${i + 1}. Parent ID: ${p.id}`);
    console.log(`   Email: ${p.email || 'N/A'}`);
    console.log(`   Name: ${p.name || 'N/A'}`);
    console.log(`   Username: ${p.username || 'N/A'}`);
    console.log('');
  });

  // Update demo1 to use the first parent
  const firstParent = parents[0];
  console.log(`\n🔧 Updating demo1 to use parent: ${firstParent.email || firstParent.id}\n`);

  const { error } = await supabase
    .from('student_accounts')
    .update({ parent_id: firstParent.id })
    .eq('username', 'demo1');

  if (error) {
    console.error('Error updating demo1:', error);
  } else {
    console.log('✅ SUCCESS! demo1 now belongs to parent:', firstParent.email || firstParent.id);
    console.log('\nNow you can access demo1 in the parent dashboard at:');
    console.log(`https://inspir.uk/students/469e65e5-333e-41d9-b67e-ef1b561deceb`);
  }
}

process.exit(0);
