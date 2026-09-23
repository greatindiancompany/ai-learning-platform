#!/usr/bin/env node

// Update Supabase database with correct asset URLs

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const SUPABASE_HOST = new URL(SUPABASE_URL).hostname;

async function updateSupabase(table, id, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      method: 'PATCH',
      hostname: SUPABASE_HOST,
      path: `/rest/v1/${table}?id=eq.${id}`,
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
          resolve(responseData);
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

async function fetchSupabase(table, query = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ksdnbkxixbywurohugkx.supabase.co',
      path: `/rest/v1/${table}?${query}`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔄 Updating Supabase database with asset URLs...\n');

  // 1. Update tool pages with OG images
  console.log('📱 Updating tool pages...');
  const tools = await fetchSupabase('seo_tool_pages', 'select=id,slug');

  for (const tool of tools) {
    const ogImage = `/assets/og-images/${tool.slug}-og.png`;
    await updateSupabase('seo_tool_pages', tool.id, {
      og_image_url: ogImage
    });
    console.log(`  ✓ ${tool.slug}: ${ogImage}`);
  }

  // 2. Update blog posts with OG images
  console.log('\n📝 Updating blog posts...');
  const posts = await fetchSupabase('seo_blog_posts', 'select=id,slug');

  for (const post of posts) {
    const ogImage = `/assets/blog/${post.slug}.png`;
    await updateSupabase('seo_blog_posts', post.id, {
      og_image_url: ogImage
    });
    console.log(`  ✓ ${post.slug}`);
  }

  // 3. Update authors with avatars
  console.log('\n👤 Updating authors...');
  const authorMap = {
    'Alex Chen': 'alex-chen',
    'Dr Sarah Mitchell': 'sarah-mitchell',
    'Emily Parker': 'emily-parker'
  };

  const authors = await fetchSupabase('seo_authors', 'select=id,name');

  for (const author of authors) {
    const slug = authorMap[author.name];
    if (slug) {
      const avatarUrl = `/assets/authors/${slug}.png`;
      await updateSupabase('seo_authors', author.id, {
        avatar_url: avatarUrl
      });
      console.log(`  ✓ ${author.name}: ${avatarUrl}`);
    }
  }

  console.log('\n✅ Database update complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Tool pages updated: ${tools.length}`);
  console.log(`  - Blog posts updated: ${posts.length}`);
  console.log(`  - Authors updated: ${Object.keys(authorMap).length}`);
}

main().catch(console.error);
