import { countWords } from './utils.js';

/**
 * Validate generation response (Stage 1)
 * @param {string} content - Generated content
 * @returns {Object} Validation result with passed flag and issues
 */
export function validateGenerationResponse(content) {
  const issues = [];

  if (!content || content.trim().length === 0) {
    issues.push('No content received');
    return { passed: false, issues };
  }

  const wordCount = countWords(content);
  if (wordCount < 1400) {
    issues.push(`Word count too low: ${wordCount} (minimum 1,400)`);
  }

  if (!content.match(/^#\s+/m)) {
    issues.push('Missing H1 title');
  }

  const h2Count = (content.match(/^##\s+/gm) || []).length;
  if (h2Count < 3) {
    issues.push(`Insufficient H2 sections: ${h2Count} (need 3+)`);
  }

  // Basic markdown validation
  const openCodeBlocks = (content.match(/```/g) || []).length;
  if (openCodeBlocks % 2 !== 0) {
    issues.push('Unclosed code blocks');
  }

  return {
    passed: issues.length === 0,
    issues,
    wordCount
  };
}

/**
 * Validate content quality (Stage 2)
 * @param {Object} post - Post object with content and metadata
 * @returns {Object} Validation result
 */
export function validateContentQuality(post) {
  const issues = [];

  // Word count (strict)
  const wordCount = countWords(post.content);
  if (wordCount < 1500) {
    issues.push(`Word count: ${wordCount} (need 1,500-2,000)`);
  } else if (wordCount > 2100) {
    issues.push(`Word count: ${wordCount} (maximum 2,100)`);
  }

  // Heading structure
  const h1Count = (post.content.match(/^#\s+/gm) || []).length;
  const h2Count = (post.content.match(/^##\s+/gm) || []).length;

  if (h1Count !== 1) {
    issues.push(`H1 count: ${h1Count} (need exactly 1)`);
  }

  if (h2Count < 5) {
    issues.push(`H2 count: ${h2Count} (need 5+)`);
  }

  // Internal links
  const toolLinks = (post.content.match(/\/tools\//g) || []).length;
  const blogLinks = (post.content.match(/\/blog\//g) || []).length;
  const totalLinks = toolLinks + blogLinks;

  if (totalLinks < 2) {
    issues.push(`Only ${totalLinks} internal links (need 2+)`);
  }

  // Placeholder text
  const placeholderPatterns = [
    /\[.*?\]/,
    /TODO/i,
    /XXX/i,
    /PLACEHOLDER/i,
    /\{.*?\}/,
    /EDIT THIS/i
  ];

  const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(post.content));
  if (hasPlaceholders) {
    issues.push('Contains placeholder text');
  }

  // Check for generic/template phrases that suggest incomplete generation
  const templatePhrases = [
    'Insert content here',
    'Add more details',
    'Expand this section',
    'Coming soon'
  ];

  const hasTemplateText = templatePhrases.some(phrase =>
    post.content.toLowerCase().includes(phrase.toLowerCase())
  );

  if (hasTemplateText) {
    issues.push('Contains template phrases');
  }

  return {
    passed: issues.length === 0,
    issues,
    wordCount
  };
}

/**
 * Validate SEO metadata (Stage 3)
 * @param {Object} post - Post object with SEO metadata
 * @returns {Object} Validation result
 */
export function validateSEO(post) {
  const issues = [];

  // SEO title length
  if (!post.seo_title) {
    issues.push('Missing SEO title');
  } else if (post.seo_title.length < 50) {
    issues.push(`SEO title too short: ${post.seo_title.length} chars (need 50-60)`);
  } else if (post.seo_title.length > 60) {
    issues.push(`SEO title too long: ${post.seo_title.length} chars (max 60)`);
  }

  // Meta description length
  if (!post.seo_description) {
    issues.push('Missing meta description');
  } else if (post.seo_description.length < 150) {
    issues.push(`Meta description too short: ${post.seo_description.length} chars (need 150-160)`);
  } else if (post.seo_description.length > 160) {
    issues.push(`Meta description too long: ${post.seo_description.length} chars (max 160)`);
  }

  // Keywords
  if (!post.seo_keywords || post.seo_keywords.length === 0) {
    issues.push('Missing SEO keywords');
  } else if (post.seo_keywords.length < 5) {
    issues.push(`Only ${post.seo_keywords.length} keywords (need 5-10)`);
  } else if (post.seo_keywords.length > 10) {
    issues.push(`Too many keywords: ${post.seo_keywords.length} (max 10)`);
  }

  // Primary keyword in title
  if (post.seo_keywords && post.seo_keywords.length > 0) {
    const primaryKeyword = post.seo_keywords[0];
    if (!post.title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      issues.push(`Primary keyword "${primaryKeyword}" not in title`);
    }
  }

  // Slug format
  if (!post.slug) {
    issues.push('Missing slug');
  } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
    issues.push(`Slug not URL-safe: ${post.slug}`);
  } else if (post.slug.length > 200) {
    issues.push(`Slug too long: ${post.slug.length} chars (max 200)`);
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Calculate quality score (0-100)
 * @param {Object} post - Post object
 * @param {Object} validationResults - Results from validation stages
 * @returns {Object} Score and breakdown
 */
export function calculateQualityScore(post, validationResults) {
  let score = 0;
  const breakdown = {};

  // Content Length (20 points)
  const wordCount = validationResults.contentQuality?.wordCount || countWords(post.content);
  if (wordCount >= 1500 && wordCount <= 2000) {
    breakdown.contentLength = 20;
  } else if (wordCount >= 1400 && wordCount <= 2100) {
    breakdown.contentLength = 15;
  } else {
    breakdown.contentLength = 10;
  }
  score += breakdown.contentLength;

  // Structure Completeness (15 points)
  const h1Count = (post.content.match(/^#\s+/gm) || []).length;
  const h2Count = (post.content.match(/^##\s+/gm) || []).length;

  if (h1Count === 1 && h2Count >= 5) {
    breakdown.structure = 15;
  } else if (h1Count === 1 && h2Count >= 3) {
    breakdown.structure = 10;
  } else {
    breakdown.structure = 5;
  }
  score += breakdown.structure;

  // SEO Optimization (20 points)
  if (validationResults.seo?.passed) {
    breakdown.seo = 20;
  } else if (validationResults.seo?.issues.length <= 2) {
    breakdown.seo = 15;
  } else {
    breakdown.seo = 10;
  }
  score += breakdown.seo;

  // Internal Links (15 points)
  const toolLinks = (post.content.match(/\/tools\//g) || []).length;
  const blogLinks = (post.content.match(/\/blog\//g) || []).length;
  const totalLinks = toolLinks + blogLinks;

  if (totalLinks >= 3) {
    breakdown.internalLinks = 15;
  } else if (totalLinks >= 2) {
    breakdown.internalLinks = 10;
  } else {
    breakdown.internalLinks = 5;
  }
  score += breakdown.internalLinks;

  // Readability (15 points - simplified check)
  // Check for good paragraph structure and varied sentence length
  const paragraphs = post.content.split(/\n\n+/).filter(p => p.trim().length > 0);
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;

  if (paragraphs.length >= 10 && avgParagraphLength > 100 && avgParagraphLength < 500) {
    breakdown.readability = 15;
  } else if (paragraphs.length >= 8) {
    breakdown.readability = 10;
  } else {
    breakdown.readability = 5;
  }
  score += breakdown.readability;

  // No Placeholder Text (15 points)
  const hasPlaceholders = validationResults.contentQuality?.issues.some(issue =>
    issue.includes('placeholder') || issue.includes('template')
  );

  breakdown.noPlaceholders = hasPlaceholders ? 0 : 15;
  score += breakdown.noPlaceholders;

  return { score, breakdown };
}

/**
 * Get quality level description
 * @param {number} score - Quality score (0-100)
 * @returns {string} Quality level
 */
export function getQualityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Acceptable';
  if (score >= 60) return 'Needs Review';
  return 'Failed';
}

/**
 * Complete post validation (all stages)
 * @param {Object} post - Post object
 * @returns {Object} Complete validation results
 */
export function validatePost(post) {
  const generation = validateGenerationResponse(post.content);
  const contentQuality = validateContentQuality(post);
  const seo = validateSEO(post);

  const { score, breakdown } = calculateQualityScore(post, {
    generation,
    contentQuality,
    seo
  });

  return {
    passed: generation.passed && contentQuality.passed && seo.passed,
    qualityScore: score,
    qualityLevel: getQualityLevel(score),
    breakdown,
    stages: {
      generation,
      contentQuality,
      seo
    }
  };
}
