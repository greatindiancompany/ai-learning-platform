import { countWords } from './utils.js';

/**
 * Generate SEO-optimized title (50-60 characters)
 * @param {string} title - Original title
 * @param {string} primaryKeyword - Primary keyword
 * @returns {string} SEO title
 */
export function generateSEOTitle(title, primaryKeyword) {
  let seoTitle = title;

  // If title is too long, create shorter version with primary keyword
  if (seoTitle.length > 60) {
    // Extract value proposition from title
    const parts = title.split(':');
    if (parts.length > 1) {
      seoTitle = `${primaryKeyword}: ${parts[1].trim()}`;
    } else {
      seoTitle = primaryKeyword + ': ' + title.substring(0, 45);
    }
  }

  // Add brand if not present and space allows
  if (!seoTitle.includes('inspir') && seoTitle.length < 50) {
    seoTitle += ' | inspir';
  }

  // Truncate to 60 chars
  return seoTitle.substring(0, 60);
}

/**
 * Generate meta description (150-160 characters)
 * @param {string} content - Blog post content
 * @param {string[]} tools - Related tools
 * @returns {string} Meta description
 */
export function generateMetaDescription(content, tools = []) {
  // Extract first 2-3 paragraphs
  const intro = extractIntroduction(content);

  // Get key benefit or action
  const actionMatch = intro.match(/(Learn|Discover|Master|Understand|Improve|Boost|Get|Find out)[^.!?]+[.!?]/);
  let description = actionMatch ? actionMatch[0] : intro.substring(0, 100);

  // Add tool mention if available
  if (tools.length > 0) {
    const toolName = tools[0].split('/').pop().replace(/-/g, ' ');
    description += ` Try ${toolName} on inspir.`;
  }

  // Truncate to 160 chars
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

/**
 * Extract introduction from content (first few paragraphs before first H2)
 * @param {string} content - Markdown content
 * @returns {string} Introduction text
 */
function extractIntroduction(content) {
  // Remove H1 title
  const withoutTitle = content.replace(/^#\s+.+\n+/, '');

  // Get content before first H2
  const beforeH2 = withoutTitle.split(/\n##\s+/)[0];

  // Remove markdown formatting
  return beforeH2
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Extract keywords from content
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {string} category - Post category
 * @returns {string[]} Array of 5-10 keywords
 */
export function extractKeywords(title, content, category) {
  const keywords = new Set();

  // 1. Primary keyword from title (usually first few words)
  const titleWords = title.toLowerCase().split(/[:\-–—]|(?=\|)/)[0].trim();
  keywords.add(titleWords);

  // 2. Extract significant words from title
  const significantWords = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !isStopWord(word));

  significantWords.slice(0, 3).forEach(word => keywords.add(word));

  // 3. Category keyword
  keywords.add(category.toLowerCase());

  // 4. Extract frequently used educational terms from content
  const educationalTerms = [
    'study', 'learning', 'students', 'education', 'techniques',
    'strategies', 'tips', 'guide', 'method', 'skills', 'exam',
    'test', 'preparation', 'revision', 'memory', 'recall',
    'notes', 'flashcards', 'practice', 'productivity'
  ];

  const contentLower = content.toLowerCase();
  const termFrequency = {};

  educationalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\w*\\b`, 'g');
    const matches = contentLower.match(regex);
    if (matches && matches.length > 2) {
      termFrequency[term] = matches.length;
    }
  });

  // Add top 3 frequent terms
  Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([term]) => keywords.add(term));

  // 5. Extract tool-related keywords
  const toolMatches = content.match(/\/tools\/([a-z-]+)/g);
  if (toolMatches) {
    toolMatches.slice(0, 2).forEach(match => {
      const toolName = match.replace('/tools/', '').replace(/-/g, ' ');
      keywords.add(toolName);
    });
  }

  // Convert to array and limit to 10
  return Array.from(keywords).slice(0, 10);
}

/**
 * Check if a word is a stop word
 * @param {string} word - Word to check
 * @returns {boolean} True if stop word
 */
function isStopWord(word) {
  const stopWords = [
    'this', 'that', 'with', 'from', 'have', 'your', 'their',
    'what', 'which', 'when', 'where', 'who', 'how', 'why',
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
    'can', 'will', 'just', 'more', 'some', 'very', 'into'
  ];
  return stopWords.includes(word.toLowerCase());
}

/**
 * Generate complete SEO metadata for a post
 * @param {Object} params - Parameters
 * @param {string} params.title - Post title
 * @param {string} params.content - Post content
 * @param {string} params.category - Post category
 * @param {string[]} params.tools - Related tools
 * @returns {Object} SEO metadata
 */
export function generateSEOMetadata({ title, content, category, tools = [] }) {
  const keywords = extractKeywords(title, content, category);
  const primaryKeyword = keywords[0];

  return {
    seo_title: generateSEOTitle(title, primaryKeyword),
    seo_description: generateMetaDescription(content, tools),
    seo_keywords: keywords,
  };
}
