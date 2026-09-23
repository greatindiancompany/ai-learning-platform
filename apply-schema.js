import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

// Read the SQL schema file
const sqlSchema = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'auth-schema.sql'), 'utf8');

// Function to execute SQL via Supabase REST API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    const req = https.request(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  console.log('🚀 Starting database schema application...\n');

  // For Supabase, we need to execute the entire SQL as one transaction
  // Let's try executing it all at once
  console.log('📝 Executing SQL schema...');
  console.log(`   Total SQL length: ${sqlSchema.length} characters\n`);

  try {
    const result = await executeSQL(sqlSchema);

    if (result.success) {
      console.log('✅ Schema applied successfully!');
      console.log('   Response:', result.data);
    } else {
      console.error('❌ Failed to apply schema');
      console.error('   Status Code:', result.statusCode);
      console.error('   Error:', result.error);
      console.error('\n💡 Note: If the error is "function exec_sql does not exist",');
      console.error('   this is expected. Supabase doesn\'t allow arbitrary SQL execution');
      console.error('   via REST API for security reasons.');
      console.error('\n   Please use the Supabase Dashboard SQL Editor instead:');
      console.error('   1. Go to https://supabase.com/dashboard');
      console.error('   2. Select your project');
      console.error('   3. Go to SQL Editor');
      console.error('   4. Paste the contents of /root/inspir/auth-schema.sql');
      console.error('   5. Click "Run"');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

main();
