#!/usr/bin/env node

// Update blog posts with new content from /tmp/blog-posts/

const fs = require('fs');
const https = require('https');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const SUPABASE_HOST = new URL(SUPABASE_URL).hostname;

async function updatePost(slug, content) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ content });
    const options = {
      method: 'PATCH',
      hostname: SUPABASE_HOST,
      path: `/rest/v1/seo_blog_posts?slug=eq.${slug}`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ slug, status: 'success', chars: content.length });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const blogDir = '/tmp/blog-posts';
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

  console.log(`📝 Updating ${files.length} blog posts...\n`);

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');

    try {
      const result = await updatePost(slug, content);
      console.log(`✅ ${slug}: ${result.chars} chars`);
    } catch (error) {
      console.error(`❌ ${slug}: ${error.message}`);
    }
  }

  console.log('\n✅ Database update complete!');
}

main().catch(console.error);
