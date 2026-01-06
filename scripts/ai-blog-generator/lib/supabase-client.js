import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

/**
 * Create Supabase client with service role key (admin access)
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Fetch all existing blog post slugs to avoid duplicates
 * @returns {Promise<string[]>} Array of existing slugs
 */
export async function getExistingSlugs() {
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select('slug');

  if (error) {
    console.error('Error fetching existing slugs:', error);
    throw error;
  }

  return data.map(post => post.slug);
}

/**
 * Get author ID by name
 * @param {string} authorName - Author name
 * @returns {Promise<string>} Author UUID
 */
export async function getAuthorId(authorName) {
  const { data, error } = await supabase
    .from('seo_authors')
    .select('id')
    .eq('name', authorName)
    .single();

  if (error || !data) {
    console.error(`Author not found: ${authorName}`);
    // Fallback to first author
    const { data: firstAuthor } = await supabase
      .from('seo_authors')
      .select('id')
      .limit(1)
      .single();
    return firstAuthor?.id;
  }

  return data.id;
}

/**
 * Get category ID by name
 * @param {string} categoryName - Category name
 * @returns {Promise<string>} Category UUID
 */
export async function getCategoryId(categoryName) {
  const { data, error } = await supabase
    .from('seo_blog_categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (error || !data) {
    throw new Error(`Category not found: ${categoryName}`);
  }

  return data.id;
}

/**
 * Insert a blog post into the database
 * @param {Object} post - Blog post data
 * @returns {Promise<Object>} Inserted post data
 */
export async function insertBlogPost(post) {
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error(`Failed to insert post: ${post.title}`);
    throw error;
  }

  return data;
}

/**
 * Check if a slug already exists
 * @param {string} slug - Slug to check
 * @returns {Promise<boolean>} True if slug exists
 */
export async function slugExists(slug) {
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select('id')
    .eq('slug', slug)
    .single();

  return !!data && !error;
}

/**
 * Get total count of blog posts
 * @returns {Promise<number>} Total count
 */
export async function getTotalPostCount() {
  const { count, error } = await supabase
    .from('seo_blog_posts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting post count:', error);
    return 0;
  }

  return count || 0;
}
