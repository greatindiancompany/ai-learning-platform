#!/usr/bin/env node

import { generateContent, getTotalCost, resetCostTracker } from './lib/anthropic-client.js';
import { generateSlug, calculateReadTime, extractExcerpt, countWords, saveJSON, loadJSON, fileExists, formatTimestamp } from './lib/utils.js';
import { generateSEOMetadata } from './lib/seo-generator.js';
import { validateGenerationResponse, validatePost } from './lib/validator.js';
import { SYSTEM_PROMPT, generateUserPrompt } from './config/prompts.js';

const BATCH_SIZE = 5;
const CHECKPOINT_INTERVAL = 5;

console.log('🚀 AI BLOG POST GENERATION');
console.log('============================================\n');

async function main() {
  try {
    // Load topics
    console.log('📥 Loading topics from config/topics.json...');
    const topicsPath = './config/topics.json';

    if (!await fileExists(topicsPath)) {
      throw new Error('Topics file not found. Run `npm run topics` first.');
    }

    const topics = await loadJSON(topicsPath);
    console.log(`   Loaded ${topics.length} topics\n`);

    // Initialize tracking
    const results = {
      successful: [],
      failed: [],
      totalTokensUsed: 0,
      startTime: new Date(),
    };

    resetCostTracker();

    // Process topics in batches
    const totalBatches = Math.ceil(topics.length / BATCH_SIZE);

    for (let i = 0; i < topics.length; i += BATCH_SIZE) {
      const batch = topics.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`\n📦 BATCH ${batchNum}/${totalBatches}: Posts ${i + 1} to ${Math.min(i + BATCH_SIZE, topics.length)}`);
      console.log('--------------------------------------------\n');

      for (const topic of batch) {
        const postNum = i + batch.indexOf(topic) + 1;
        console.log(`🚀 Post ${postNum}/${topics.length}: ${topic.title}`);

        try {
          // Generate blog post
          const post = await generateBlogPost(topic, postNum);

          // Validate
          const validation = validatePost(post);

          if (validation.qualityScore >= 70) {
            results.successful.push({ topic, post, validation });
            console.log(`   ✅ Success (score: ${validation.qualityScore}/100 - ${validation.qualityLevel})\n`);
          } else {
            console.log(`   ⚠️  Low quality (score: ${validation.qualityScore}/100 - ${validation.qualityLevel})`);
            console.log(`   Issues: ${validation.stages.contentQuality.issues.join(', ')}`);
            results.failed.push({ topic, post, validation, reason: 'low_quality' });
            console.log();
          }

          results.totalTokensUsed += post.usage.totalTokens;

        } catch (error) {
          console.error(`   ❌ Error: ${error.message}\n`);
          results.failed.push({ topic, error: error.message, reason: 'generation_error' });
        }
      }

      // Save checkpoint
      if ((i + BATCH_SIZE) % CHECKPOINT_INTERVAL === 0 || i + BATCH_SIZE >= topics.length) {
        await saveCheckpoint(results, batchNum);
        console.log(`\n💾 Checkpoint saved at batch ${batchNum}\n`);
      }

      // Batch summary
      console.log('--------------------------------------------');
      console.log(`📊 Batch ${batchNum} Summary:`);
      console.log(`   ✅ Successful: ${results.successful.length}`);
      console.log(`   ❌ Failed: ${results.failed.length}`);
      console.log(`   💰 Cost so far: $${getTotalCost().toFixed(3)}`);
      console.log('--------------------------------------------');
    }

    // Save all generated posts
    console.log('\n💾 Saving generated posts...');
    for (let i = 0; i < results.successful.length; i++) {
      const { post } = results.successful[i];
      const filename = `./output/generated-posts/post-${String(i + 1).padStart(3, '0')}.json`;
      await saveJSON(filename, post);
    }
    console.log(`   Saved ${results.successful.length} posts to output/generated-posts/\n`);

    // Generate final report
    await generateReport(results, topics.length);

    // Success!
    console.log('\n✅ Generation complete! Next step: Run `npm run publish` to publish posts\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Generate a single blog post
 * @param {Object} topic - Topic configuration
 * @param {number} postNum - Post number
 * @returns {Promise<Object>} Generated post
 */
async function generateBlogPost(topic, postNum) {
  // Generate user prompt
  const userPrompt = generateUserPrompt(topic);

  // Call Claude API
  const response = await generateContent(SYSTEM_PROMPT, userPrompt);

  // Validate response
  const validation = validateGenerationResponse(response.content);
  if (!validation.passed) {
    throw new Error(`Generation validation failed: ${validation.issues.join(', ')}`);
  }

  // Extract metadata
  const content = response.content.trim();
  const excerpt = extractExcerpt(content);
  const readTime = calculateReadTime(content);

  // Generate SEO metadata
  const seoMetadata = generateSEOMetadata({
    title: topic.title,
    content,
    category: topic.category,
    tools: topic.tools || [],
  });

  // Build post object
  const post = {
    postNumber: postNum,
    title: topic.title,
    slug: topic.slug,
    excerpt,
    content,
    category: topic.category,
    ...seoMetadata,
    avg_read_time_minutes: readTime,
    usage: response.usage,
    generatedAt: formatTimestamp(),
  };

  return post;
}

/**
 * Save checkpoint
 * @param {Object} results - Current results
 * @param {number} batchNum - Batch number
 */
async function saveCheckpoint(results, batchNum) {
  const checkpoint = {
    batchNum,
    timestamp: formatTimestamp(),
    successful: results.successful.length,
    failed: results.failed.length,
    totalCost: getTotalCost(),
  };

  await saveJSON(`./output/checkpoints/checkpoint-batch-${batchNum}.json`, checkpoint);
}

/**
 * Generate final report
 * @param {Object} results - Generation results
 * @param {number} totalTopics - Total number of topics
 */
async function generateReport(results, totalTopics) {
  const endTime = new Date();
  const duration = Math.round((endTime - results.startTime) / 1000 / 60); // minutes

  // Calculate quality stats
  const scores = results.successful.map(r => r.validation.qualityScore);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  const qualityBreakdown = {
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 80 && s < 90).length,
    acceptable: scores.filter(s => s >= 70 && s < 80).length,
    needsReview: scores.filter(s => s >= 60 && s < 70).length,
    failed: scores.filter(s => s < 60).length + results.failed.length,
  };

  const report = {
    summary: {
      totalTopics,
      successful: results.successful.length,
      failed: results.failed.length,
      successRate: `${Math.round((results.successful.length / totalTopics) * 100)}%`,
      avgQualityScore: avgScore,
      totalCost: getTotalCost(),
      duration: `${duration} minutes`,
      timestamp: formatTimestamp(endTime),
    },
    qualityBreakdown,
    tokenUsage: {
      total: results.totalTokensUsed,
      average: Math.round(results.totalTokensUsed / results.successful.length),
    },
    failedPosts: results.failed.map(f => ({
      title: f.topic?.title || 'Unknown',
      reason: f.reason,
      error: f.error || f.validation?.stages.contentQuality.issues.join(', '),
    })),
  };

  await saveJSON('./output/reports/generation-report.json', report);

  // Print summary
  console.log('\n============================================');
  console.log('📊 FINAL REPORT');
  console.log('============================================\n');
  console.log(`Total Topics: ${totalTopics}`);
  console.log(`✅ Successful: ${results.successful.length} (${report.summary.successRate})`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⭐ Average Quality Score: ${avgScore}/100\n`);

  console.log('Quality Breakdown:');
  console.log(`  90-100 (Excellent): ${qualityBreakdown.excellent}`);
  console.log(`  80-89  (Good): ${qualityBreakdown.good}`);
  console.log(`  70-79  (Acceptable): ${qualityBreakdown.acceptable}`);
  console.log(`  60-69  (Needs Review): ${qualityBreakdown.needsReview}`);
  console.log(`  <60    (Failed): ${qualityBreakdown.failed}\n`);

  console.log(`💰 Total Cost: $${getTotalCost().toFixed(3)}`);
  console.log(`⏱  Duration: ${duration} minutes`);
  console.log(`📝 Report saved to: output/reports/generation-report.json`);
  console.log('============================================');
}

main();
