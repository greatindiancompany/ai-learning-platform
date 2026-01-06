/**
 * Category to author mapping
 * Based on inspir's author profiles and expertise
 */
export const CATEGORY_AUTHOR_MAP = {
  'Study Skills & Techniques': 'Dr. Sarah Chen',
  'Tool Guides & Tutorials': 'James Wright',
  'Exam Prep & Test-Taking': 'Emily Parker',
  'Subject-Specific Help': 'Dr. Sarah Chen',
  'Productivity & Motivation': 'James Wright',
  'Time Management': 'James Wright',
  'Note-Taking': 'Dr. Sarah Chen',
  'Memory & Retention': 'Dr. Sarah Chen',
  'Learning Science': 'Dr. Sarah Chen',
  'Student Wellbeing': 'Emily Parker',
  'AI & Technology in Education': 'James Wright',
  'Career & Future Planning': 'Emily Parker',
};

/**
 * Get author name for a given category
 * @param {string} category - Category name
 * @returns {string} Author name
 */
export function getAuthorForCategory(category) {
  return CATEGORY_AUTHOR_MAP[category] || 'Dr. Sarah Chen';
}

/**
 * Category distribution for 42 posts
 */
export const TARGET_DISTRIBUTION = {
  'Study Skills & Techniques': 12,
  'Tool Guides & Tutorials': 10,
  'Exam Prep & Test-Taking': 8,
  'Subject-Specific Help': 5,
  'Productivity & Motivation': 4,
  'Time Management': 3,
};

/**
 * All available categories in the system
 */
export const ALL_CATEGORIES = [
  'Study Skills & Techniques',
  'Tool Guides & Tutorials',
  'Subject-Specific Help',
  'Exam Prep & Test-Taking',
  'Productivity & Motivation',
  'AI & Technology in Education',
  'Time Management',
  'Note-Taking',
  'Memory & Retention',
  'Learning Science',
  'Student Wellbeing',
  'Career & Future Planning',
];

/**
 * inspir tools with their URLs
 */
export const INSPIR_TOOLS = {
  flashcards: '/tools/flashcards',
  quizGenerator: '/tools/quiz-generator',
  practiceTests: '/tools/practice-tests',
  studyTimer: '/tools/study-timer',
  mathSolver: '/tools/math-solver',
  visualLearning: '/tools/visual-learning',
  habitTracker: '/tools/habit-tracker',
  aiPlanner: '/tools/ai-planner',
  imageAnalysis: '/tools/image-analysis',
  notesSync: '/tools/notes-sync',
};

/**
 * Get tools relevant to a category
 * @param {string} category - Category name
 * @returns {string[]} Array of tool URLs
 */
export function getToolsForCategory(category) {
  const toolMap = {
    'Study Skills & Techniques': [
      INSPIR_TOOLS.flashcards,
      INSPIR_TOOLS.quizGenerator,
      INSPIR_TOOLS.practiceTests,
      INSPIR_TOOLS.studyTimer,
    ],
    'Tool Guides & Tutorials': [
      INSPIR_TOOLS.quizGenerator,
      INSPIR_TOOLS.flashcards,
      INSPIR_TOOLS.mathSolver,
      INSPIR_TOOLS.aiPlanner,
    ],
    'Exam Prep & Test-Taking': [
      INSPIR_TOOLS.practiceTests,
      INSPIR_TOOLS.quizGenerator,
      INSPIR_TOOLS.flashcards,
      INSPIR_TOOLS.studyTimer,
    ],
    'Subject-Specific Help': [
      INSPIR_TOOLS.mathSolver,
      INSPIR_TOOLS.imageAnalysis,
      INSPIR_TOOLS.visualLearning,
      INSPIR_TOOLS.quizGenerator,
    ],
    'Productivity & Motivation': [
      INSPIR_TOOLS.habitTracker,
      INSPIR_TOOLS.studyTimer,
      INSPIR_TOOLS.aiPlanner,
    ],
    'Time Management': [
      INSPIR_TOOLS.aiPlanner,
      INSPIR_TOOLS.studyTimer,
      INSPIR_TOOLS.habitTracker,
    ],
  };

  return toolMap[category] || [
    INSPIR_TOOLS.quizGenerator,
    INSPIR_TOOLS.flashcards,
    INSPIR_TOOLS.studyTimer,
  ];
}
