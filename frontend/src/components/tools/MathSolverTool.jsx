import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { mathApi } from '../../utils/toolsApi';

export default function MathSolverTool() {
  const [view, setView] = useState('list'); // 'list', 'solve', 'result'
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Solve problem form
  const [problem, setProblem] = useState('');
  const [topic, setTopic] = useState('algebra');
  const [currentSolution, setCurrentSolution] = useState(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      const response = await mathApi.getProblems();
      if (response.data.success) {
        setSolutions(response.data.problems || []);
      }
    } catch (err) {
      console.error('Error fetching solutions:', err);
    }
  };

  const handleSolveProblem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await mathApi.solve({ problem, topic });
      if (response.data.success) {
        setCurrentSolution(response.data.solution);
        setView('result');
        setProblem('');
      } else {
        setError(response.data.error || 'Failed to solve problem');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentSolution(null);
    fetchSolutions();
  };

  const renderMathContent = (text) => {
    if (!text) return null;

    // Split text by $$ for block math and $ for inline math
    const parts = [];
    let current = '';
    let i = 0;

    while (i < text.length) {
      if (text[i] === '$' && text[i + 1] === '$') {
        // Block math
        if (current) {
          parts.push({ type: 'text', content: current });
          current = '';
        }
        i += 2;
        let mathContent = '';
        while (i < text.length - 1 && !(text[i] === '$' && text[i + 1] === '$')) {
          mathContent += text[i];
          i++;
        }
        parts.push({ type: 'block', content: mathContent });
        i += 2;
      } else if (text[i] === '$') {
        // Inline math
        if (current) {
          parts.push({ type: 'text', content: current });
          current = '';
        }
        i++;
        let mathContent = '';
        while (i < text.length && text[i] !== '$') {
          mathContent += text[i];
          i++;
        }
        parts.push({ type: 'inline', content: mathContent });
        i++;
      } else {
        current += text[i];
        i++;
      }
    }

    if (current) {
      parts.push({ type: 'text', content: current });
    }

    return parts.map((part, idx) => {
      if (part.type === 'block') {
        return (
          <div key={idx} className="my-4">
            <BlockMath math={part.content} />
          </div>
        );
      } else if (part.type === 'inline') {
        return <InlineMath key={idx} math={part.content} />;
      } else {
        return <span key={idx}>{part.content}</span>;
      }
    });
  };

  const renderListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Math Problem Solver</h2>
        <button
          onClick={() => setView('solve')}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + New Problem
        </button>
      </div>

      {solutions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🧮</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No solutions yet</h3>
          <p className="text-gray-500 mb-6">Get step-by-step solutions to any math problem</p>
          <button
            onClick={() => setView('solve')}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Solve a Problem
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {solutions.map((solution) => (
            <motion.div
              key={solution.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition-all cursor-pointer"
              onClick={() => {
                setCurrentSolution(solution);
                setView('result');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize">
                      {solution.topic}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(solution.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-800 font-semibold mb-2">
                    {renderMathContent(solution.problem)}
                  </div>
                  {solution.final_answer && (
                    <div className="text-sm text-green-600 font-semibold mt-2">
                      Answer: {renderMathContent(solution.final_answer)}
                    </div>
                  )}
                </div>
                <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition-colors">
                  View →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderSolveView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Solve Math Problem</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSolveProblem} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Topic
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['algebra', 'calculus', 'geometry', 'statistics'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`py-3 px-4 rounded-lg font-semibold capitalize transition-all ${
                  topic === t
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Math Problem
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Enter your math problem. Use plain text or LaTeX notation (e.g., 2x + 5 = 15 or solve integral of x^2 dx)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows="6"
            required
          />
          <div className="mt-2 text-xs text-gray-500">
            <strong>Tip:</strong> For equations with fractions, use format like "x/2 + 3 = 5" or LaTeX "\frac{"{"}x{"}"}{"{"}2{"}"}"
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !problem.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Solving with AI...
            </span>
          ) : (
            '🧮 Solve with AI'
          )}
        </button>
      </form>
    </motion.div>
  );

  const renderResultView = () => {
    if (!currentSolution) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Solution</h2>
          <button
            onClick={handleBackToList}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Problems
          </button>
        </div>

        {/* Problem */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-indigo-700">PROBLEM:</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold capitalize">
              {currentSolution.topic}
            </span>
          </div>
          <div className="text-lg text-gray-800">
            {renderMathContent(currentSolution.problem)}
          </div>
        </div>

        {/* Step-by-step solution */}
        {currentSolution.steps && currentSolution.steps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Step-by-Step Solution:</h3>
            {currentSolution.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border-l-4 border-indigo-400 p-6 rounded-r-lg shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800">
                      {renderMathContent(step)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Final answer */}
        {currentSolution.final_answer && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✓</span>
              <span className="text-lg font-bold text-green-700">Final Answer:</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {renderMathContent(currentSolution.final_answer)}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setView('solve')}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Solve Another Problem
          </button>
          <button
            onClick={handleBackToList}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View All Solutions
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <AnimatePresence mode="wait">
        {view === 'list' && renderListView()}
        {view === 'solve' && renderSolveView()}
        {view === 'result' && renderResultView()}
      </AnimatePresence>
    </div>
  );
}
