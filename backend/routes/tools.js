import express from 'express';
import * as toolsController from '../controllers/toolsController.js';
import { authenticateStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

// All tools routes require authentication
router.use(authenticateStudent);

// ============================================
// 1. DRAW/SKETCH TOOL ROUTES
// ============================================
router.get('/sketches', toolsController.getSketches);
router.post('/sketches', toolsController.createSketch);
router.put('/sketches/:id', toolsController.updateSketch);
router.delete('/sketches/:id', toolsController.deleteSketch);

// ============================================
// 2. QUIZ GENERATOR TOOL ROUTES
// ============================================
router.post('/quizzes/generate', toolsController.generateQuiz);
router.get('/quizzes', toolsController.getQuizzes);
router.post('/quizzes/attempts', toolsController.submitQuizAttempt);

// ============================================
// 3. FLASHCARDS TOOL ROUTES
// ============================================
router.get('/flashcards/decks', toolsController.getFlashcardDecks);
router.post('/flashcards/decks', toolsController.createFlashcardDeck);
router.get('/flashcards/decks/:deck_id/cards', toolsController.getFlashcards);
router.post('/flashcards/cards', toolsController.createFlashcard);
router.put('/flashcards/cards/:id/mastery', toolsController.updateFlashcardMastery);

// ============================================
// 4. PRACTICE TESTS TOOL ROUTES
// ============================================
router.get('/tests', toolsController.getPracticeTests);
router.post('/tests', toolsController.createPracticeTest);
router.post('/tests/attempts', toolsController.submitTestAttempt);

// ============================================
// 5. STUDY TIMER TOOL ROUTES
// ============================================
router.get('/timer/sessions', toolsController.getStudySessions);
router.post('/timer/sessions', toolsController.startStudySession);
router.put('/timer/sessions/:id/complete', toolsController.completeStudySession);

// ============================================
// 6. HABIT TRACKER TOOL ROUTES
// ============================================
router.get('/habits', toolsController.getHabits);
router.post('/habits', toolsController.createHabit);
router.post('/habits/complete', toolsController.completeHabit);

// ============================================
// 8. STUDY MUSIC TOOL ROUTES
// ============================================
router.get('/music/playlists', toolsController.getMusicPlaylists);
router.post('/music/playlists', toolsController.createMusicPlaylist);
router.post('/music/history', toolsController.logMusicPlay);

// ============================================
// 9. IMAGE ANALYSIS TOOL ROUTES
// ============================================
router.post('/images/analyze', toolsController.analyzeImage);
router.get('/images/analyses', toolsController.getImageAnalyses);

// ============================================
// 10. MATH SOLVER TOOL ROUTES
// ============================================
router.post('/math/solve', toolsController.solveMathProblem);
router.get('/math/problems', toolsController.getMathProblems);

// ============================================
// 11. SCIENCE LAB TOOL ROUTES
// ============================================
router.get('/science/experiments', toolsController.getExperiments);
router.post('/science/experiments', toolsController.createExperiment);

// ============================================
// 12. VISUAL LEARNING TOOL ROUTES
// ============================================
router.get('/visual', toolsController.getVisualLearning);
router.post('/visual', toolsController.createVisualLearning);
router.put('/visual/:id', toolsController.updateVisualLearning);

// ============================================
// 13. NOTES SYNC TOOL ROUTES
// ============================================
router.get('/notes', toolsController.getNotes);
router.post('/notes', toolsController.createNote);
router.put('/notes/:id', toolsController.updateNote);
router.delete('/notes/:id', toolsController.deleteNote);

// ============================================
// 14. AI PLANNER TOOL ROUTES
// ============================================
router.get('/planner/plans', toolsController.getStudyPlans);
router.post('/planner/plans', toolsController.createStudyPlan);
router.get('/planner/tasks', toolsController.getStudyTasks);
router.post('/planner/tasks', toolsController.createStudyTask);
router.put('/planner/tasks/:id/complete', toolsController.completeStudyTask);

// ============================================
// 15. GOAL SETTER TOOL ROUTES
// ============================================
router.get('/goals', toolsController.getGoals);
router.post('/goals', toolsController.createGoal);
router.put('/goals/:id/progress', toolsController.updateGoalProgress);
router.post('/goals/milestones', toolsController.createGoalMilestone);
router.put('/goals/milestones/:id/complete', toolsController.completeMilestone);

export default router;
