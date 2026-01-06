import axios from 'axios';
import API_URL from './api';
import { getToken } from './auth';

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Base tools API
const toolsAPI = axios.create({
  baseURL: `${API_URL}/tools`,
});

// Add auth token to all requests
toolsAPI.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. DRAW/SKETCH
export const sketchesApi = {
  getAll: () => toolsAPI.get('/sketches'),
  create: (data) => toolsAPI.post('/sketches', data),
  update: (id, data) => toolsAPI.put(`/sketches/${id}`, data),
  delete: (id) => toolsAPI.delete(`/sketches/${id}`),
};

// 2. QUIZ GENERATOR
export const quizzesApi = {
  generate: (data) => toolsAPI.post('/quizzes/generate', data),
  getAll: () => toolsAPI.get('/quizzes'),
  submitAttempt: (data) => toolsAPI.post('/quizzes/attempts', data),
};

// 3. FLASHCARDS
export const flashcardsApi = {
  getDecks: () => toolsAPI.get('/flashcards/decks'),
  createDeck: (data) => toolsAPI.post('/flashcards/decks', data),
  getCards: (deckId) => toolsAPI.get(`/flashcards/decks/${deckId}/cards`),
  createCard: (data) => toolsAPI.post('/flashcards/cards', data),
  updateMastery: (id, level) => toolsAPI.put(`/flashcards/cards/${id}/mastery`, { mastery_level: level }),
};

// 4. PRACTICE TESTS
export const testsApi = {
  getAll: () => toolsAPI.get('/tests'),
  create: (data) => toolsAPI.post('/tests', data),
  submitAttempt: (data) => toolsAPI.post('/tests/attempts', data),
};

// 5. STUDY TIMER
export const timerApi = {
  getSessions: (date) => toolsAPI.get('/timer/sessions', { params: { date } }),
  start: (data) => toolsAPI.post('/timer/sessions', data),
  complete: (id) => toolsAPI.put(`/timer/sessions/${id}/complete`),
};

// 6. HABITS
export const habitsApi = {
  getAll: () => toolsAPI.get('/habits'),
  create: (data) => toolsAPI.post('/habits', data),
  complete: (data) => toolsAPI.post('/habits/complete', data),
};

// 8. MUSIC
export const musicApi = {
  getPlaylists: () => toolsAPI.get('/music/playlists'),
  createPlaylist: (data) => toolsAPI.post('/music/playlists', data),
  logPlay: (data) => toolsAPI.post('/music/history', data),
};

// 9. IMAGE ANALYSIS
export const imagesApi = {
  analyze: (data) => toolsAPI.post('/images/analyze', data),
  getAll: () => toolsAPI.get('/images/analyses'),
};

// 10. MATH SOLVER
export const mathApi = {
  solve: (data) => toolsAPI.post('/math/solve', data),
  getProblems: () => toolsAPI.get('/math/problems'),
};

// 11. SCIENCE LAB
export const scienceApi = {
  getExperiments: () => toolsAPI.get('/science/experiments'),
  createExperiment: (data) => toolsAPI.post('/science/experiments', data),
};

// 12. VISUAL LEARNING
export const visualApi = {
  getAll: () => toolsAPI.get('/visual'),
  create: (data) => toolsAPI.post('/visual', data),
  update: (id, data) => toolsAPI.put(`/visual/${id}`, data),
};

// 13. NOTES
export const notesApi = {
  getAll: (subject) => toolsAPI.get('/notes', { params: { subject } }),
  create: (data) => toolsAPI.post('/notes', data),
  update: (id, data) => toolsAPI.put(`/notes/${id}`, data),
  delete: (id) => toolsAPI.delete(`/notes/${id}`),
};

// 14. AI PLANNER
export const plannerApi = {
  getPlans: () => toolsAPI.get('/planner/plans'),
  createPlan: (data) => toolsAPI.post('/planner/plans', data),
  getTasks: (planId) => toolsAPI.get('/planner/tasks', { params: { plan_id: planId } }),
  createTask: (data) => toolsAPI.post('/planner/tasks', data),
  completeTask: (id) => toolsAPI.put(`/planner/tasks/${id}/complete`),
};

// 15. GOALS
export const goalsApi = {
  getAll: () => toolsAPI.get('/goals'),
  create: (data) => toolsAPI.post('/goals', data),
  updateProgress: (id, data) => toolsAPI.put(`/goals/${id}/progress`, data),
  createMilestone: (data) => toolsAPI.post('/goals/milestones', data),
  completeMilestone: (id) => toolsAPI.put(`/goals/milestones/${id}/complete`),
};

export default toolsAPI;
