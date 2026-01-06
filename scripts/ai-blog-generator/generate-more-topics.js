#!/usr/bin/env node

import { generateContent } from './lib/anthropic-client.js';
import { getExistingSlugs } from './lib/supabase-client.js';
import { generateSlug, saveJSON, loadJSON } from './lib/utils.js';
import { SYSTEM_PROMPT } from './config/prompts.js';

console.log('🚀 GENERATING ADDITIONAL TOPICS');
console.log('============================================\n');

const ADDITIONAL_PROMPT = `Generate exactly 25 diverse blog post topic ideas for inspir, focusing on the following categories:

TARGET DISTRIBUTION:
- Exam Prep & Test-Taking: 7 topics (SAT, GCSE, AP exams, test anxiety, finals week)
- Subject-Specific Help: 5 topics (math study tips, science help, essay writing, languages)
- Productivity & Motivation: 5 topics (staying motivated, beating procrastination, burnout)
- Time Management: 5 topics (study schedules, Pomodoro techniques, work-life balance)
- Extra Study Skills: 3 topics (additional study techniques not yet covered)

REQUIREMENTS:
- Students aged 14-25
- Clear search intent (how-to, guide, strategies)
- Connect to inspir tools
- Practical and actionable

OUTPUT FORMAT (JSON):
{
  "topics": [
    {
      "title": "SAT Math Section: Proven Strategies to Boost Your Score",
      "category": "Exam Prep & Test-Taking",
      "keywords": ["SAT", "math section", "test prep", "strategies"],
      "searchIntent": "Learn effective strategies for SAT math",
      "audience": "high school students preparing for SAT",
      "painPoint": "struggling with SAT math section time management",
      "tools": ["/tools/math-solver", "/tools/practice-tests"],
      "sections": [
        "Understanding the SAT Math Section",
        "Time Management Strategies",
        "Common Question Types",
        "Calculator vs No-Calculator",
        "Practice Problems",
        "Test Day Tips"
      ]
    }
  ]
}

Generate all 25 topics now.`;

async function main() {
  try {
    // Load existing topics
    console.log('📥 Loading existing topics...');
    const existingTopics = await loadJSON('./config/topics.json');
    const existingSlugs = existingTopics.map(t => t.slug);
    console.log(`   Found ${existingTopics.length} existing topics\n`);

    // Fetch database slugs
    const dbSlugs = await getExistingSlugs();
    const allExistingSlugs = [...new Set([...existingSlugs, ...dbSlugs])];

    // Generate additional topics
    console.log('🤖 Generating 25 additional topics...\n');

    const response = await generateContent(SYSTEM_PROMPT, ADDITIONAL_PROMPT);

    // Parse response
    console.log('📊 Parsing topics...');
    let data;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log('   ⚠️  JSON parsing failed, trying to fix...');
      const jsonMatch = response.content.match(/\{[\s\S]*$/);
      if (!jsonMatch) throw new Error('Failed to extract JSON');

      let jsonStr = jsonMatch[0];
      const lastCompleteIndex = jsonStr.lastIndexOf('}');
      if (lastCompleteIndex > 0) {
        jsonStr = jsonStr.substring(0, lastCompleteIndex + 1);
        if (!jsonStr.endsWith(']}')) {
          jsonStr += ']}';
        }
      }
      data = JSON.parse(jsonStr);
    }

    const newTopics = (data.topics || []).map(topic => ({
      ...topic,
      slug: generateSlug(topic.title),
    }));

    console.log(`   Generated ${newTopics.length} topics\n`);

    // Filter duplicates
    const uniqueNew = newTopics.filter(t => !allExistingSlugs.includes(t.slug));
    console.log(`   ${uniqueNew.length} unique new topics\n`);

    // Merge with existing
    const allTopics = [...existingTopics, ...uniqueNew];
    console.log(`📊 Total topics: ${allTopics.length}\n`);

    // Show distribution
    const distribution = {};
    allTopics.forEach(topic => {
      distribution[topic.category] = (distribution[topic.category] || 0) + 1;
    });

    console.log('Category Distribution:');
    Object.entries(distribution).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    console.log();

    // Save
    await saveJSON('./config/topics.json', allTopics);
    console.log(`✅ Saved ${allTopics.length} topics to config/topics.json\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
