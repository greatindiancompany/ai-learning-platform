import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('Finding parent account: demo@inspir.uk...\n');

// Find the parent account
const { data: parent, error: parentError } = await supabase
  .from('parent_accounts')
  .select('*')
  .eq('email', 'demo@inspir.uk')
  .single();

if (parentError || !parent) {
  console.error('❌ Parent account demo@inspir.uk not found!');
  console.error('Error:', parentError);

  // Try to find any parent with 'demo' in email
  const { data: demoParents } = await supabase
    .from('parent_accounts')
    .select('id, email, name')
    .ilike('email', '%demo%');

  if (demoParents && demoParents.length > 0) {
    console.log('\nFound similar parent accounts:');
    demoParents.forEach(p => {
      console.log(`  - ${p.email} (ID: ${p.id})`);
    });
  }

  process.exit(1);
}

console.log('✅ Found parent account!');
console.log('  ID:', parent.id);
console.log('  Email:', parent.email);
console.log('  Name:', parent.name || 'N/A');

// Update demo1 to belong to this parent
console.log('\nLinking demo1 to this parent...\n');

const { error: updateError } = await supabase
  .from('student_accounts')
  .update({ parent_id: parent.id })
  .eq('username', 'demo1');

if (updateError) {
  console.error('❌ Error linking demo1:', updateError);
  process.exit(1);
}

console.log('✅ SUCCESS! demo1 is now linked to demo@inspir.uk');
console.log('\nYou can now access demo1 at:');
console.log('https://inspir.uk/students/469e65e5-333e-41d9-b67e-ef1b561deceb');
console.log('\nMemory tab will show all 5 memory facts!');

process.exit(0);
