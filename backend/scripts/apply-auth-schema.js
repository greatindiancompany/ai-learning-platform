import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applySQLSchema() {
  try {
    console.log('📖 Reading auth schema file...');
    const schemaPath = path.join(__dirname, '../../auth-schema.sql');
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    console.log('✅ Schema file loaded successfully');
    console.log(`📊 Total SQL length: ${sqlSchema.length} characters\n`);

    // Split SQL into individual statements
    // Remove comments and split by semicolons
    const statements = sqlSchema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement || statement.length < 5) continue;

      // Log statement type
      const stmtType = statement.split(/\s+/)[0].toUpperCase();
      const stmtPreview = statement.substring(0, 80).replace(/\s+/g, ' ');

      console.log(`[${i + 1}/${statements.length}] Executing ${stmtType}: ${stmtPreview}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Try direct execution via REST API if RPC doesn't work
          const { error: directError } = await supabase
            .from('_sql_execution')
            .select('*')
            .limit(0); // This won't work, but we'll use another method

          // Actually, let's use the SQL execution endpoint
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: statement + ';' })
          });

          if (!response.ok) {
            console.error(`   ❌ Error: ${error?.message || 'Unknown error'}`);
            errorCount++;
          } else {
            console.log('   ✅ Success');
            successCount++;
          }
        } else {
          console.log('   ✅ Success');
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 EXECUTION SUMMARY:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. This might be expected if:');
      console.log('   - Tables already exist');
      console.log('   - Functions already exist');
      console.log('   - Triggers already exist');
      console.log('\n💡 Check the errors above to determine if they are critical.');
    } else {
      console.log('\n🎉 All statements executed successfully!');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
applySQLSchema();
