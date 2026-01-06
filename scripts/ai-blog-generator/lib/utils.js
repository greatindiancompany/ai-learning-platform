import slugify from 'slugify';

/**
 * Count words in text
 * @param {string} text - Text to count words in
 * @returns {number} Word count
 */
export function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate read time based on word count
 * Average reading speed: 225 words per minute
 * @param {string} content - Content to calculate read time for
 * @returns {number} Read time in minutes (1-30)
 */
export function calculateReadTime(content) {
  const wordCount = countWords(content);
  const minutes = Math.ceil(wordCount / 225);
  return Math.max(1, Math.min(minutes, 30)); // Clamp between 1-30
}

/**
 * Generate URL-safe slug from title
 * @param {string} title - Title to convert to slug
 * @returns {string} URL-safe slug (max 200 chars)
 */
export function generateSlug(title) {
  const slug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  return slug.substring(0, 200); // Database limit
}

/**
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract first paragraph from markdown content
 * @param {string} content - Markdown content
 * @returns {string} First paragraph (excerpt)
 */
export function extractExcerpt(content) {
  // Remove H1 title
  const withoutTitle = content.replace(/^#\s+.+\n+/, '');

  // Get first paragraph (before first H2)
  const firstParagraph = withoutTitle.split(/\n## /)[0].trim();

  // Remove markdown formatting
  const plainText = firstParagraph
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  // Truncate to 300 chars
  if (plainText.length > 300) {
    return plainText.substring(0, 297) + '...';
  }

  return plainText;
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate cost for Claude API usage
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {number} Cost in dollars
 */
export function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000000) * 3;   // $3 per 1M tokens
  const outputCost = (outputTokens / 1000000) * 15; // $15 per 1M tokens
  return inputCost + outputCost;
}

/**
 * Format timestamp for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Save JSON data to file
 * @param {string} filepath - Path to save file
 * @param {any} data - Data to save
 */
export async function saveJSON(filepath, data) {
  const fs = await import('fs/promises');
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Load JSON data from file
 * @param {string} filepath - Path to load file from
 * @returns {Promise<any>} Parsed JSON data
 */
export async function loadJSON(filepath) {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Check if file exists
 * @param {string} filepath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function fileExists(filepath) {
  const fs = await import('fs/promises');
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}
