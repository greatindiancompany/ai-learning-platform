/**
 * System prompt for consistent writing style across all blog posts
 */
export const SYSTEM_PROMPT = `You are an expert educational content writer for inspir, an AI-powered study platform for students aged 14-25.

WRITING STYLE:
- Clear, engaging, and accessible (not academic jargon)
- Evidence-based with research citations where appropriate (mention institutions without full references)
- Practical with actionable steps and examples
- Optimistic and motivating tone (students struggle, encourage them)
- Modern and relatable (mention apps, technology, current trends)

CONTENT STRUCTURE:
- Use H2 (##) and H3 (###) headings for clear organization
- Include bullet points and numbered lists for scannability
- Add blockquotes (>) for key insights or expert tips
- Bold (**text**) important concepts and takeaways
- Write in markdown format with proper syntax

SEO BEST PRACTICES:
- Naturally integrate keywords (avoid keyword stuffing)
- Answer user search intent directly in first paragraph
- Use semantic variations of main keywords throughout
- Front-load important information (inverted pyramid style)
- Include practical examples and actionable advice

INSPIR TOOL INTEGRATION:
Always mention 2-4 inspir tools contextually. Use markdown links:
- Format: [Tool Name](/tools/tool-slug)
- Place naturally within content (not just at the end)
- Explain how the tool helps with the concept being discussed

Available tools:
- AI Flashcards (/tools/flashcards)
- Quiz Generator (/tools/quiz-generator)
- Practice Tests (/tools/practice-tests)
- Study Timer (/tools/study-timer)
- Math Solver (/tools/math-solver)
- Visual Learning (/tools/visual-learning)
- Habit Tracker (/tools/habit-tracker)
- AI Planner (/tools/ai-planner)
- Image Analysis (/tools/image-analysis)

CRITICAL REQUIREMENTS:
- MUST write between 1,500-2,000 words (strict requirement)
- Start with an engaging hook that addresses student pain points
- Include at least 5 H2 (##) sections
- Add at least 2 internal links (to tools or blog posts)
- End with clear call-to-action encouraging tool usage
- Use subheadings every 200-300 words for readability
- Do NOT include meta commentary like "Here's the blog post..."
- Return ONLY the markdown content starting with the H1 title`;

/**
 * Generate user prompt for a specific topic
 * @param {Object} topic - Topic configuration
 * @returns {string} User prompt
 */
export function generateUserPrompt(topic) {
  const sectionsText = topic.sections
    ? topic.sections.map((section, i) => `${i + 1}. ${section}`).join('\n')
    : generateDefaultSections(topic.title);

  const relatedTools = topic.tools || [
    '/tools/quiz-generator',
    '/tools/flashcards',
    '/tools/study-timer'
  ];

  const toolsText = relatedTools.map(tool => {
    const name = tool.split('/').pop().split('-').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    return `- ${name} (${tool})`;
  }).join('\n');

  return `Write a comprehensive, SEO-optimized blog post for inspir's education blog.

TOPIC: ${topic.title}
CATEGORY: ${topic.category}
TARGET AUDIENCE: ${topic.audience || 'high school and college students'}
PRIMARY KEYWORDS: ${topic.keywords.join(', ')}
WORD COUNT: 1,500-2,000 words (strict requirement)

REQUIRED STRUCTURE:
${sectionsText}

INSPIR TOOLS TO MENTION:
${toolsText}

TONE: ${topic.tone || 'Encouraging and practical, but conversational'}

SPECIAL INSTRUCTIONS:
- Start with an engaging hook that addresses ${topic.painPoint || 'a common student challenge'}
- Include 2-3 real-world examples or practical scenarios
- Add "Pro Tips" or "Expert Advice" callout boxes using blockquotes (>)
- End with a clear call-to-action encouraging students to try the mentioned tools
- Use subheadings every 200-300 words for readability
- Include at least one statistic or research finding per major section

OUTPUT FORMAT:
Return ONLY the markdown content (no meta-commentary).
Start immediately with the H1 title: # ${topic.title}

Do NOT include SEO metadata, slug, or any other fields in the output - just the markdown content.`;
}

/**
 * Generate default section structure based on topic type
 * @param {string} title - Topic title
 * @returns {string} Default sections
 */
function generateDefaultSections(title) {
  const isHowTo = /how to|guide|tutorial/i.test(title);
  const isComparison = /vs|versus|compared/i.test(title);

  if (isHowTo) {
    return `1. What is [Main Concept]?
2. Why [Main Concept] is Important
3. Step-by-Step Guide to [Main Concept]
4. Common Mistakes to Avoid
5. Advanced Tips and Strategies
6. Tools and Resources
7. Conclusion and Next Steps`;
  }

  if (isComparison) {
    return `1. Introduction to Both Methods
2. [Method A]: Overview and Benefits
3. [Method B]: Overview and Benefits
4. Head-to-Head Comparison
5. Which Should You Choose?
6. How to Get Started
7. Conclusion`;
  }

  // Default structure
  return `1. What is [Main Concept]?
2. The Science: Why It Works
3. Practical Applications
4. Implementation Strategies
5. Common Challenges and Solutions
6. Advanced Techniques
7. Tools to Help You Succeed
8. Conclusion`;
}

/**
 * Topic generation prompt for creating 42 topic ideas
 */
export const TOPIC_GENERATION_PROMPT = `Generate 60 diverse blog post topic ideas for inspir, an AI-powered study platform for students.

REQUIREMENTS:
- Target audience: Students aged 14-25 (high school, college, university)
- Topics must have clear search intent (how-to, guide, strategies, comparison, etc.)
- Balance high-volume keywords with long-tail opportunities
- Ensure variety across different learning styles and subjects
- Each topic should connect naturally to at least 2 inspir tools

CATEGORY DISTRIBUTION:
- Study Skills & Techniques: 18 topics (active recall, spaced repetition, note-taking, learning science)
- Tool Guides & Tutorials: 15 topics (how to use specific study tools effectively)
- Exam Prep & Test-Taking: 12 topics (SAT, GCSE, AP, test anxiety, preparation strategies)
- Subject-Specific Help: 8 topics (math, science, languages, essay writing)
- Productivity & Motivation: 5 topics (staying motivated, avoiding burnout, study habits)
- Time Management: 5 topics (study schedules, Pomodoro, work-life balance)

OUTPUT FORMAT (JSON):
{
  "topics": [
    {
      "title": "The Science of Active Recall: Double Your Memory Retention",
      "category": "Study Skills & Techniques",
      "keywords": ["active recall", "study technique", "memory retention", "learning science"],
      "searchIntent": "Learn how to use active recall to improve exam performance",
      "audience": "high school and college students preparing for exams",
      "painPoint": "forgetting information soon after studying it",
      "tools": ["/tools/flashcards", "/tools/quiz-generator"],
      "sections": [
        "What is Active Recall?",
        "The Neuroscience: Why Active Recall Works",
        "Active Recall vs. Passive Review",
        "5 Active Recall Techniques for Students",
        "How to Implement Active Recall by Subject",
        "Common Mistakes and How to Avoid Them",
        "Combining Active Recall with Spaced Repetition",
        "Conclusion and Next Steps"
      ]
    }
  ]
}

Generate all 60 topics now with complete details for each.`;
