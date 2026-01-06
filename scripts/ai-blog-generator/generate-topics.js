#!/usr/bin/env node

import { generateContent, getTotalCost } from './lib/anthropic-client.js';
import { getExistingSlugs } from './lib/supabase-client.js';
import { generateSlug, saveJSON } from './lib/utils.js';
import { TOPIC_GENERATION_PROMPT, SYSTEM_PROMPT } from './config/prompts.js';
import { TARGET_DISTRIBUTION } from './config/categories.js';

console.log('🚀 BLOG TOPIC GENERATION');
console.log('============================================\n');

async function main() {
  try {
    // Step 1: Fetch existing slugs to avoid duplicates
    console.log('📥 Fetching existing blog post slugs...');
    const existingSlugs = await getExistingSlugs();
    console.log(`   Found ${existingSlugs.length} existing posts\n`);

    // Step 2: Generate 60 topic ideas with Claude API
    console.log('🤖 Generating 60 topic ideas with Claude API...');
    console.log('   (This may take a minute...)\n');

    const response = await generateContent(
      SYSTEM_PROMPT,
      TOPIC_GENERATION_PROMPT
    );

    // Step 3: Parse JSON response
    console.log('📊 Parsing topics...');
    let data;
    try {
      // Try to find JSON in response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log('   ⚠️  JSON parsing failed, trying to fix...');

      // Try to extract and fix the JSON
      const jsonMatch = response.content.match(/\{[\s\S]*$/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }

      let jsonStr = jsonMatch[0];

      // Remove any incomplete entries at the end
      const lastCompleteEntryIndex = jsonStr.lastIndexOf('}');
      if (lastCompleteEntryIndex > 0) {
        jsonStr = jsonStr.substring(0, lastCompleteEntryIndex + 1);
        // Add closing brackets if needed
        if (!jsonStr.endsWith(']}')) {
          jsonStr += ']}';
        }
      }

      data = JSON.parse(jsonStr);
    }

    const generatedTopics = data.topics || [];

    console.log(`   Generated ${generatedTopics.length} topics\n`);

    // Step 4: Add slugs and check for duplicates
    console.log('🔍 Checking for duplicates and adding slugs...');
    const topicsWithSlugs = generatedTopics.map(topic => ({
      ...topic,
      slug: generateSlug(topic.title),
    }));

    // Filter out duplicates
    const uniqueTopics = topicsWithSlugs.filter(topic => {
      return !existingSlugs.includes(topic.slug);
    });

    console.log(`   ${uniqueTopics.length} unique topics (${generatedTopics.length - uniqueTopics.length} duplicates removed)\n`);

    // Step 5: Select best 42 topics based on category distribution
    console.log('✅ Selecting top 42 topics...');
    const selectedTopics = selectTopicsByDistribution(uniqueTopics, TARGET_DISTRIBUTION);

    console.log(`   Selected ${selectedTopics.length} topics\n`);

    // Step 6: Display distribution
    console.log('📊 CATEGORY DISTRIBUTION:');
    console.log('--------------------------------------------');
    const distribution = {};
    selectedTopics.forEach(topic => {
      distribution[topic.category] = (distribution[topic.category] || 0) + 1;
    });

    Object.entries(distribution).forEach(([category, count]) => {
      const target = TARGET_DISTRIBUTION[category] || 0;
      const status = count === target ? '✅' : '⚠️ ';
      console.log(`${status} ${category}: ${count}/${target}`);
    });
    console.log();

    // Step 7: Save to topics.json
    const outputPath = './config/topics.json';
    await saveJSON(outputPath, selectedTopics);

    console.log('✅ Topics saved to config/topics.json\n');

    // Final summary
    console.log('============================================');
    console.log('📊 SUMMARY:');
    console.log(`   Total topics generated: ${generatedTopics.length}`);
    console.log(`   Unique topics: ${uniqueTopics.length}`);
    console.log(`   Selected for generation: ${selectedTopics.length}`);
    console.log(`   Cost: $${getTotalCost().toFixed(3)}`);
    console.log('============================================\n');

    console.log('✅ Next step: Run `npm run generate` to create blog posts\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Select topics based on target distribution
 * @param {Array} topics - All unique topics
 * @param {Object} distribution - Target distribution per category
 * @returns {Array} Selected topics
 */
function selectTopicsByDistribution(topics, distribution) {
  const selected = [];
  const byCategory = {};

  // Group topics by category
  topics.forEach(topic => {
    if (!byCategory[topic.category]) {
      byCategory[topic.category] = [];
    }
    byCategory[topic.category].push(topic);
  });

  // Select topics for each category based on target distribution
  Object.entries(distribution).forEach(([category, target]) => {
    const categoryTopics = byCategory[category] || [];
    const toSelect = Math.min(target, categoryTopics.length);

    // Take first N topics (they're already in a good order from Claude)
    selected.push(...categoryTopics.slice(0, toSelect));

    if (toSelect < target) {
      console.warn(`⚠️  Warning: Only found ${toSelect}/${target} topics for ${category}`);
    }
  });

  return selected;
}

main();
