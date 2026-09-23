import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Set DATABASE_URL before running this script.');
  process.exit(1);
}

const pg = await import('pg');
const Client = pg.Client || pg.default.Client;

const connectionStrings = [databaseUrl];

async function tryConnection(connectionString, index) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: true } });

  try {
    console.log(`\n🔌 Trying connection method ${index + 1}...`);
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read SQL schema
    const sqlSchema = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'auth-schema.sql'), 'utf8');
    console.log(`📖 Loaded SQL schema (${sqlSchema.length} characters)`);

    // Execute the schema
    console.log('⚙️  Executing schema...');
    await client.query(sqlSchema);

    console.log('✅ Schema applied successfully!');
    await client.end();
    return true;

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    if (error.code === 'ENOTFOUND') {
      console.error('   Host not found. Trying next connection method...');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Need actual database password.');
    } else if (error.message.includes('already exists')) {
      console.log('   ⚠️  Some objects already exist (this is OK)');
    } else {
      console.error(`   Error code: ${error.code}`);
    }

    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Attempting to connect to Supabase PostgreSQL database...\n');

  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await tryConnection(connectionStrings[i], i);
    if (success) {
      console.log('\n🎉 Schema application completed!');
      process.exit(0);
    }
  }

  console.log('\n❌ All connection methods failed.');
  console.log('\n💡 Set DATABASE_URL to the Postgres connection string from the Supabase dashboard.');
  console.log('   Project ref: ksdnbkxixbywurohugkx');
  console.log('   Settings → Database → Connection string');
  console.log('\n   OR use the SQL Editor in the Supabase Dashboard:');
  console.log('   1. Go to SQL Editor');
  console.log('   2. Paste the contents of auth-schema.sql');
  console.log('   3. Click "Run"');

  process.exit(1);
}

main();
