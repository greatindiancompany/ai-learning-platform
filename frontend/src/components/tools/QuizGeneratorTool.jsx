import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizzesApi } from '../../utils/toolsApi';

export default function QuizGeneratorTool() {
  const [view, setView] = useState('list'); // 'list', 'create', 'take', 'results'
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Create quiz form
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  // Taking quiz
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesApi.getAll();
      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await quizzesApi.generate({ topic, difficulty, questionCount });
      if (response.data.success) {
        await fetchQuizzes();
        setView('list');
        setTopic('');
        setDifficulty('medium');
        setQuestionCount(5);
      } else {
        setError(response.data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizScore(null);
    setView('take');
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Calculate score
    let score = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        score++;
      }
    });

    const totalQuestions = currentQuiz.questions.length;
    setQuizScore({ score, totalQuestions });

    // Submit to backend
    try {
      await quizzesApi.submitAttempt({
        quiz_id: currentQuiz.id,
        answers: userAnswers,
        score,
        total_questions: totalQuestions
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }

    setView('results');
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentQuiz(null);
    setQuizScore(null);
    fetchQuizzes();
  };

  const renderCreateView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleCreateQuiz} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quiz Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., World War II, Photosynthesis, Python Functions"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`py-3 px-4 rounded-lg font-semibold capitalize transition-all ${
                  difficulty === level
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Questions: {questionCount}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3</span>
            <span>15</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Quiz with AI...
            </span>
          ) : (
            '🪄 Generate Quiz with AI'
          )}
        </button>
      </form>
    </motion.div>
  );

  const renderListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Quizzes</h2>
        <button
          onClick={() => setView('create')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No quizzes yet</h3>
          <p className="text-gray-500 mb-6">Create your first AI-generated quiz to get started</p>
          <button
            onClick={() => setView('create')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all cursor-pointer"
              onClick={() => handleStartQuiz(quiz)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      📚 {quiz.topic}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-semibold capitalize ${
                      quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {quiz.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      ❓ {quiz.questions?.length || 0} questions
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-colors">
                  Start →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderTakeView = () => {
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Quiz not available</h3>
          <button
            onClick={handleBackToList}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      );
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{currentQuiz.title}</h2>
          <button
            onClick={handleBackToList}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
          <p className={`font-semibold text-gray-800 ${isMobile ? 'text-base mb-4' : 'text-lg mb-6'}`}>{currentQuestion.question}</p>

          <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
            {currentQuestion.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = userAnswers[currentQuestionIndex] === optionLabel;

              return (
                <motion.button
                  key={idx}
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, optionLabel)}
                  className={`w-full text-left ${isMobile ? 'p-3' : 'p-4'} rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-100 shadow-md'
                      : 'border-gray-300 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                    <div className={`${isMobile ? 'w-7 h-7 text-sm' : 'w-8 h-8'} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {optionLabel}
                    </div>
                    <span className={`${isMobile ? 'text-sm' : ''} ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex items-center justify-between ${isMobile ? 'pt-3 gap-2' : 'pt-4'}`}>
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            ← {isMobile ? 'Prev' : 'Previous'}
          </button>

          {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length !== currentQuiz.questions.length}
              className={`${isMobile ? 'px-5 py-2 text-sm' : 'px-8 py-3'} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            >
              Submit {!isMobile && 'Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
            >
              {isMobile ? 'Next' : 'Next'} →
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderResultsView = () => {
    if (!quizScore || !currentQuiz) return null;

    const percentage = (quizScore.score / quizScore.totalQuestions) * 100;
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="space-y-6 text-center"
      >
        <div className={`inline-block p-8 rounded-full ${passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <div className="text-6xl">
            {passed ? '🎉' : '📚'}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {passed ? 'Great Job!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-600">
            {passed
              ? 'You passed the quiz! Keep up the excellent work.'
              : 'Practice makes perfect. Review the material and try again!'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-8">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            {quizScore.score}/{quizScore.totalQuestions}
          </div>
          <p className="text-xl font-semibold text-gray-700">
            {percentage.toFixed(0)}% Correct
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleStartQuiz(currentQuiz)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            🔄 Retake Quiz
          </button>
          <button
            onClick={handleBackToList}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Back to Quizzes
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === 'list' && renderListView()}
        {view === 'create' && renderCreateView()}
        {view === 'take' && renderTakeView()}
        {view === 'results' && renderResultsView()}
      </AnimatePresence>
    </div>
  );
}
