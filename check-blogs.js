const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogs() {
  console.log('Checking blog posts...\n');

  // Check blog posts
  const { data: posts, error: postsError } = await supabase
    .from('seo_blog_posts')
    .select('id, title, slug, published, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  } else {
    console.log(`Found ${posts.length} blog posts:`);
    posts.forEach(post => {
      console.log(`  - ${post.title} (${post.slug}) - Published: ${post.published}`);
    });
  }

  console.log('\n\nChecking categories...\n');

  // Check categories
  const { data: categories, error: catError } = await supabase
    .from('seo_blog_categories')
    .select('id, name, slug');

  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
  }

  console.log('\n\nChecking authors...\n');

  // Check authors
  const { data: authors, error: authError } = await supabase
    .from('seo_authors')
    .select('id, name, slug');

  if (authError) {
    console.error('Error fetching authors:', authError);
  } else {
    console.log(`Found ${authors.length} authors:`);
    authors.forEach(author => {
      console.log(`  - ${author.name} (${author.slug})`);
    });
  }
}

checkBlogs().then(() => process.exit(0));
