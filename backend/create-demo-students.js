const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');
const bcrypt = (await import('bcrypt')).default;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDemoAccounts() {
    console.log('🚀 Creating demo parent and student accounts...\n');

    try {
        // 1. Create demo parent account
        console.log('1️⃣  Creating demo parent account...');
        const parentPasswordHash = await bcrypt.hash('demoparent123', 10);

        const { data: parent, error: parentError } = await supabase
            .from('parent_accounts')
            .upsert({
                email: 'demo@inspir.uk',
                password_hash: parentPasswordHash,
                account_type: 'parent',
                subscription_status: 'active',
                email_verified: true,
                student_limit: 10
            }, {
                onConflict: 'email'
            })
            .select()
            .single();

        if (parentError) {
            console.error('❌ Error creating parent:', parentError);
            return;
        }

        console.log(`✅ Demo parent created: ${parent.email} (ID: ${parent.id})\n`);

        // 2. Create demo students
        const demoStudents = [
            { username: 'demo1', password: 'demo123', display_name: 'Demo Student 1' },
            { username: 'demo2', password: 'demo123', display_name: 'Demo Student 2' },
            { username: 'demo3', password: 'demo123', display_name: 'Demo Student 3' }
        ];

        console.log('2️⃣  Creating demo students...');

        for (const student of demoStudents) {
            const passwordHash = await bcrypt.hash(student.password, 10);

            const { data, error } = await supabase
                .from('student_accounts')
                .upsert({
                    parent_id: parent.id,
                    username: student.username,
                    password_hash: passwordHash,
                    display_name: student.display_name,
                    is_active: true,
                    age_group: 'teen'
                }, {
                    onConflict: 'username'
                })
                .select()
                .single();

            if (error) {
                console.error(`   ❌ Error creating ${student.username}:`, error.message);
            } else {
                console.log(`   ✅ Created: ${student.username} (${student.display_name})`);
            }
        }

        console.log('\n✅ Demo accounts created successfully!\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 STUDENT LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Username: demo1 | Password: demo123');
        console.log('Username: demo2 | Password: demo123');
        console.log('Username: demo3 | Password: demo123');
        console.log('🌐 Student Login: https://inspir.uk/studentlogin');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('👨‍👩‍👧‍👦 PARENT LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Email: demo@inspir.uk | Password: demoparent123');
        console.log('🌐 Parent Login: https://inspir.uk/login');
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('💥 Error:', error);
    }
}

createDemoAccounts();
