import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testsApi } from '../../utils/toolsApi';

export default function PracticeTestTool() {
  const [view, setView] = useState('list'); // 'list', 'create', 'take', 'results'
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create test
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '', points: 1 });

  // Taking test
  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const fetchTests = async () => {
    try {
      const response = await testsApi.getAll();
      if (response.data.success) {
        setTests(response.data.tests || []);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await testsApi.create({
        title: testTitle,
        subject: testSubject,
        duration_minutes: testDuration,
        questions
      });

      if (response.data.success) {
        await fetchTests();
        setView('list');
        setTestTitle('');
        setTestSubject('');
        setTestDuration(60);
        setQuestions([]);
      } else {
        setError(response.data.error || 'Failed to create test');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.question.trim() && newQuestion.answer.trim()) {
      setQuestions([...questions, { ...newQuestion }]);
      setNewQuestion({ question: '', answer: '', points: 1 });
    }
  };

  const handleStartTest = (test) => {
    setCurrentTest(test);
    setAnswers({});
    setTimeLeft(test.duration_minutes * 60);
    setTestStarted(true);
    setTestResult(null);
    setView('take');
  };

  const handleSubmitTest = async () => {
    setTestStarted(false);

    // Calculate score
    let totalScore = 0;
    let earnedScore = 0;
    const scoredQuestions = currentTest.questions.map((q, idx) => {
      const totalPoints = parseInt(q.points) || 1;
      totalScore += totalPoints;

      const userAnswer = answers[idx] || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();

      if (isCorrect) {
        earnedScore += totalPoints;
      }

      return {
        ...q,
        userAnswer,
        correct: isCorrect
      };
    });

    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;

    const result = {
      totalScore,
      earnedScore,
      percentage,
      questions: scoredQuestions
    };

    setTestResult(result);

    // Submit to backend
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/tools/tests/${currentTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          answers,
          score: earnedScore,
          max_score: totalScore
        })
      });
    } catch (err) {
      console.error('Error submitting test:', err);
    }

    setView('results');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Practice Tests</h2>
        <button
          onClick={() => setView('create')}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Create Test
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests yet</h3>
          <p className="text-gray-500 mb-6">Create your first practice test</p>
          <button
            onClick={() => setView('create')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Test
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      📚 {test.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {test.duration_minutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      ❓ {test.questions?.length || 0} questions
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Created {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleStartTest(test)}
                  className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                >
                  Start Test →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderCreateView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create Practice Test</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleCreateTest} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Title
            </label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              placeholder="e.g., Midterm Practice Exam"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              placeholder="e.g., Biology, Math, History"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test Duration: {testDuration} minutes
          </label>
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={testDuration}
            onChange={(e) => setTestDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15 min</span>
            <span>180 min</span>
          </div>
        </div>

        {/* Add question */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add Question</h3>
          <div className="space-y-3">
            <textarea
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              placeholder="Enter question"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                placeholder="Correct answer"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                min="1"
                max="10"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                placeholder="Points"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              + Add Question
            </button>
          </div>
        </div>

        {/* Questions list */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">
              Questions ({questions.length})
            </h3>
            <div className="grid gap-2">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {idx + 1}. {q.question}
                      </div>
                      <div className="text-sm text-green-600">Answer: {q.answer}</div>
                      <div className="text-xs text-gray-500 mt-1">{q.points} point(s)</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !testTitle.trim() || !testSubject.trim() || questions.length === 0}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Test'}
        </button>
      </form>
    </motion.div>
  );

  const renderTakeView = () => {
    if (!currentTest) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b-2 border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentTest.title}</h2>
            <p className="text-sm text-gray-600">{currentTest.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmitTest}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {currentTest.questions.map((question, idx) => (
            <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">{question.question}</div>
                  <div className="text-xs text-gray-500">{question.points} point(s)</div>
                </div>
              </div>
              <textarea
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                placeholder="Your answer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderResultsView = () => {
    if (!testResult) return null;

    const passed = testResult.percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className={`inline-block p-8 rounded-full ${passed ? 'bg-green-100' : 'bg-yellow-100'} mb-4`}>
            <div className="text-6xl">{passed ? '🎉' : '📚'}</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {passed ? 'Great Work!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-6">{currentTest?.title}</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              {testResult.earnedScore}/{testResult.totalScore}
            </div>
            <p className="text-xl font-semibold text-gray-700">
              {testResult.percentage.toFixed(1)}% Score
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">Review Answers:</h3>
          {testResult.questions.map((q, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg p-4 ${
                q.correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${q.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {q.correct ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-2">{idx + 1}. {q.question}</div>
                  <div className="text-sm space-y-1">
                    <div className="text-gray-700">
                      <strong>Your answer:</strong> {q.userAnswer || '(No answer)'}
                    </div>
                    {!q.correct && (
                      <div className="text-green-700">
                        <strong>Correct answer:</strong> {q.answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStartTest(currentTest)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Retake Test
          </button>
          <button
            onClick={() => { setView('list'); fetchTests(); }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <AnimatePresence mode="wait">
        {view === 'list' && renderListView()}
        {view === 'create' && renderCreateView()}
        {view === 'take' && renderTakeView()}
        {view === 'results' && renderResultsView()}
      </AnimatePresence>
    </div>
  );
}
