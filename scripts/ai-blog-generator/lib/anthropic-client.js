import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { sleep } from './utils.js';

dotenv.config({ path: '../../backend/.env' });

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY in environment variables');
}

export const anthropic = new Anthropic({ apiKey });

// Configuration
export const CONFIG = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,          // ~2,000 words
  temperature: 0.7,         // Balanced creativity
  delayBetweenRequests: 2000, // 2 seconds
  maxRetries: 3,
  budgetLimit: 10.00,       // $10 hard limit
};

// Track costs
let totalCost = 0;

/**
 * Generate content with Claude API
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Object>} Response with content and usage
 */
export async function generateContent(systemPrompt, userPrompt, retries = CONFIG.maxRetries) {
  try {
    // Rate limiting delay
    await sleep(CONFIG.delayBetweenRequests);

    console.log(`   ⏳ Calling Claude API...`);

    const message = await anthropic.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Calculate cost
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = ((inputTokens / 1000000) * 3) + ((outputTokens / 1000000) * 15);

    totalCost += cost;

    // Budget check
    if (totalCost > CONFIG.budgetLimit) {
      throw new Error(`💰 Budget exceeded: $${totalCost.toFixed(2)} > $${CONFIG.budgetLimit}`);
    }

    // Budget warning at 80%
    if (totalCost > CONFIG.budgetLimit * 0.8) {
      console.warn(`⚠️  Budget alert: $${totalCost.toFixed(2)}/${CONFIG.budgetLimit} (${(totalCost / CONFIG.budgetLimit * 100).toFixed(1)}%)`);
    }

    console.log(`   ✅ Response received (${outputTokens} tokens, $${cost.toFixed(3)})`);

    return {
      content: message.content[0].text,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
      },
    };

  } catch (error) {
    // Handle rate limiting
    if (error.status === 429 && retries > 0) {
      console.warn(`⚠️  Rate limit hit, retrying in 60 seconds... (${retries} retries left)`);
      await sleep(60000);
      return generateContent(systemPrompt, userPrompt, retries - 1);
    }

    // Handle other errors
    if (retries > 0) {
      console.warn(`⚠️  Error occurred, retrying... (${retries} retries left)`);
      console.warn(`   Error: ${error.message}`);
      await sleep(5000);
      return generateContent(systemPrompt, userPrompt, retries - 1);
    }

    // No retries left
    throw error;
  }
}

/**
 * Get total cost spent so far
 * @returns {number} Total cost in dollars
 */
export function getTotalCost() {
  return totalCost;
}

/**
 * Reset cost tracker
 */
export function resetCostTracker() {
  totalCost = 0;
}
