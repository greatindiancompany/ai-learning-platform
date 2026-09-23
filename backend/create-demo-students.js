import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const SUPABASE_URL = 'https://ksdnbkxixbywurohugkx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZG5ia3hpeGJ5d3Vyb2h1Z2t4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE0NDQ5NywiZXhwIjoyMDgxNzIwNDk3fQ.wPsceDO3tTGXacwBipTYIMsmBD2W4ZHXjjDZk_pQ5NY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDemoAccounts() {
    console.log('🚀 Creating demo parent and student accounts...\n');

    try {
        // 1. Create demo parent account
        console.log('1️⃣  Creating demo parent account...');
        const parentPassword = process.env.DEMO_PARENT_PASSWORD;
        const studentPassword = process.env.DEMO_STUDENT_PASSWORD;
        if (!parentPassword || !studentPassword || parentPassword.length < 10 || studentPassword.length < 10) {
            console.error('Set DEMO_PARENT_PASSWORD and DEMO_STUDENT_PASSWORD (at least 10 characters) in the environment. Do not commit them.');
            process.exit(1);
        }

        const parentPasswordHash = await bcrypt.hash(parentPassword, 10);

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
            { username: 'demo1', display_name: 'Demo Student 1' },
            { username: 'demo2', display_name: 'Demo Student 2' },
            { username: 'demo3', display_name: 'Demo Student 3' }
        ];

        console.log('2️⃣  Creating demo students...');

        for (const student of demoStudents) {
            const passwordHash = await bcrypt.hash(studentPassword, 10);

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

        console.log('\nDemo accounts created. Passwords were read from the environment and are not printed.');
        console.log('Student usernames: demo1, demo2, demo3');
        console.log('Parent email: demo@inspir.uk');

    } catch (error) {
        console.error('💥 Error:', error);
    }
}

createDemoAccounts();
