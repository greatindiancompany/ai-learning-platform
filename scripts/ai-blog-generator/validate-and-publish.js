#!/usr/bin/env node

import { readdir } from 'fs/promises';
import { loadJSON, saveJSON, countWords } from './lib/utils.js';
import { validatePost } from './lib/validator.js';
import { getAuthorId, getCategoryId, insertBlogPost, slugExists, getTotalPostCount } from './lib/supabase-client.js';
import { getAuthorForCategory } from './config/categories.js';

const MIN_QUALITY_SCORE = 70; // Only publish posts scoring 70+

console.log('🚀 BLOG POST PUBLICATION');
console.log('============================================\n');

async function main() {
  try {
    // Get current post count
    const currentCount = await getTotalPostCount();
    console.log(`📊 Current blog posts in database: ${currentCount}\n`);

    // Load generated posts
    console.log('📥 Loading generated posts...');
    const postsDir = './output/generated-posts';
    const files = await readdir(postsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort();

    if (jsonFiles.length === 0) {
      throw new Error('No generated posts found. Run `npm run generate` first.');
    }

    const posts = await Promise.all(
      jsonFiles.map(file => loadJSON(`${postsDir}/${file}`))
    );

    console.log(`   Loaded ${posts.length} posts\n`);

    // Filter posts by quality score
    console.log(`🔍 Filtering posts (minimum score: ${MIN_QUALITY_SCORE})...`);
    const qualifiedPosts = [];
    const lowQualityPosts = [];

    for (const post of posts) {
      const validation = validatePost(post);
      post._validation = validation;

      if (validation.qualityScore >= MIN_QUALITY_SCORE) {
        qualifiedPosts.push(post);
      } else {
        lowQualityPosts.push(post);
      }
    }

    console.log(`   ✅ Qualified: ${qualifiedPosts.length}`);
    console.log(`   ⚠️  Low quality: ${lowQualityPosts.length}\n`);

    if (lowQualityPosts.length > 0) {
      console.log('⚠️  Low quality posts:');
      lowQualityPosts.forEach(post => {
        console.log(`     ${post.title} (score: ${post._validation.qualityScore})`);
      });
      console.log();
    }

    // Publish qualified posts
    console.log('📝 Publishing posts to Supabase...\n');
    const results = {
      published: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < qualifiedPosts.length; i++) {
      const post = qualifiedPosts[i];
      const num = i + 1;

      console.log(`${num}/${qualifiedPosts.length}: ${post.title}`);

      try {
        // Check if slug already exists
        if (await slugExists(post.slug)) {
          console.log(`   ⏭️  Skipped (slug already exists)\n`);
          results.skipped.push({ post, reason: 'Slug already exists' });
          continue;
        }

        // Get author ID
        const authorName = getAuthorForCategory(post.category);
        const authorId = await getAuthorId(authorName);

        // Get category ID
        const categoryId = await getCategoryId(post.category);

        // Prepare database insert
        const dbPost = {
          title: post.title.substring(0, 200),
          slug: post.slug.substring(0, 200),
          excerpt: post.excerpt.substring(0, 300),
          content: post.content,
          author_id: authorId,
          category_id: categoryId,
          seo_title: post.seo_title.substring(0, 60),
          seo_description: post.seo_description.substring(0, 160),
          seo_keywords: post.seo_keywords,
          canonical_url: `https://inspir.uk/blog/${post.slug}`,
          og_image_url: '/assets/blog/default-og-image.png',
          og_image_alt: `${post.title} - inspir Blog`,
          twitter_card_type: 'summary_large_image',
          status: 'published',
          published_at: new Date().toISOString(),
          featured: false,
          avg_read_time_minutes: post.avg_read_time_minutes,
          view_count: 0,
        };

        // Insert into database
        const inserted = await insertBlogPost(dbPost);

        console.log(`   ✅ Published`);
        console.log(`      URL: https://inspir.uk/blog/${post.slug}`);
        console.log(`      Words: ${countWords(post.content)}`);
        console.log(`      Score: ${post._validation.qualityScore}/100`);
        console.log();

        results.published.push({ post, inserted });

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        results.failed.push({ post, error: error.message });
      }
    }

    // Get new total count
    const newCount = await getTotalPostCount();

    // Generate publication report
    await generatePublicationReport(results, currentCount, newCount);

    // Final message
    if (results.published.length > 0) {
      console.log('\n✅ Publication complete!');
      console.log(`   Total posts in database: ${newCount} (was ${currentCount})`);
      console.log(`   Successfully published: ${results.published.length}`);
      console.log(`   Failed: ${results.failed.length}`);
      console.log(`   Skipped: ${results.skipped.length}\n`);
    } else {
      console.log('\n⚠️  No posts were published.');
      if (results.failed.length > 0) {
        console.log('   Check the errors above and try again.\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Generate publication report
 * @param {Object} results - Publication results
 * @param {number} beforeCount - Post count before publication
 * @param {number} afterCount - Post count after publication
 */
async function generatePublicationReport(results, beforeCount, afterCount) {
  const report = {
    timestamp: new Date().toISOString(),
    before: beforeCount,
    after: afterCount,
    added: results.published.length,
    summary: {
      published: results.published.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
    },
    publishedPosts: results.published.map(r => ({
      title: r.post.title,
      slug: r.post.slug,
      category: r.post.category,
      wordCount: countWords(r.post.content),
      qualityScore: r.post._validation.qualityScore,
      url: `https://inspir.uk/blog/${r.post.slug}`,
    })),
    failedPosts: results.failed.map(r => ({
      title: r.post.title,
      slug: r.post.slug,
      error: r.error,
    })),
    skippedPosts: results.skipped.map(r => ({
      title: r.post.title,
      slug: r.post.slug,
      reason: r.reason,
    })),
  };

  await saveJSON('./output/reports/publication-report.json', report);

  console.log('\n============================================');
  console.log('📊 PUBLICATION REPORT');
  console.log('============================================\n');
  console.log(`Posts before: ${beforeCount}`);
  console.log(`Posts after: ${afterCount}`);
  console.log(`Added: ${results.published.length}\n`);

  console.log('Status:');
  console.log(`  ✅ Published: ${results.published.length}`);
  console.log(`  ❌ Failed: ${results.failed.length}`);
  console.log(`  ⏭️  Skipped: ${results.skipped.length}\n`);

  if (results.published.length > 0) {
    console.log('Published Posts:');
    results.published.slice(0, 5).forEach(r => {
      console.log(`  • ${r.post.title} (${r.post._validation.qualityScore}/100)`);
    });
    if (results.published.length > 5) {
      console.log(`  ... and ${results.published.length - 5} more`);
    }
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('Failed Posts:');
    results.failed.forEach(r => {
      console.log(`  ❌ ${r.post.title}: ${r.error}`);
    });
    console.log();
  }

  console.log(`📝 Report saved to: output/reports/publication-report.json`);
  console.log('============================================');
}

main();
