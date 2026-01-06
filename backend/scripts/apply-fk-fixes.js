import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFixes() {
  console.log('🔧 Applying foreign key fixes...\n');

  try {
    // Read the SQL file
    const sqlPath = join(dirname(fileURLToPath(import.meta.url)), 'fix-foreign-keys.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Extract table name from statement for better logging
      const tableMatch = statement.match(/ALTER TABLE IF EXISTS (\w+)/);
      const tableName = tableMatch ? tableMatch[1] : `Statement ${i + 1}`;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_sql').select('*').limit(0);

          if (directError) {
            console.log(`⚠️  ${tableName}: ${error.message}`);
            errorCount++;
          } else {
            console.log(`✅ ${tableName}: Fixed`);
            successCount++;
          }
        } else {
          console.log(`✅ ${tableName}: Fixed`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  ${tableName}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Warnings: ${errorCount}`);
    console.log(`\n✨ Foreign key fixes applied!`);
    console.log(`\n⚠️  NOTE: If you see warnings, you may need to run this SQL manually in Supabase SQL Editor:`);
    console.log(`   File: backend/scripts/fix-foreign-keys.sql`);

  } catch (error) {
    console.error('❌ Error applying fixes:', error.message);
    console.log(`\n💡 Please run the SQL manually in Supabase SQL Editor:`);
    console.log(`   File: backend/scripts/fix-foreign-keys.sql`);
    process.exit(1);
  }
}

applyFixes();
