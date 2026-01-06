// ============================================================================
// STUDENT MEMORY VIEW - Parent Dashboard
// ============================================================================
// Allows parents to view and manage what inspir remembers about their student
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URL from '../../utils/api';
import { getToken } from '../../utils/auth';

export default function StudentMemoryView({ studentId, studentName }) {
  const [memory, setMemory] = useState({
    interest: [],
    goal: [],
    preference: [],
    learning_style: [],
    strength: [],
    challenge: [],
    other: []
  });
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadMemory();
    }
  }, [studentId]);

  const loadMemory = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/parents/students/${studentId}/memory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Group by type
      const grouped = {
        interest: [],
        goal: [],
        preference: [],
        learning_style: [],
        strength: [],
        challenge: [],
        other: []
      };

      response.data.memory.forEach((fact) => {
        const type = fact.fact_type || 'other';
        if (grouped[type]) {
          grouped[type].push(fact);
        } else {
          grouped.other.push(fact);
        }
      });

      setMemory(grouped);
    } catch (error) {
      console.error('Error loading memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFact = async (factId) => {
    try {
      const token = getToken();
      await axios.delete(
        `${API_URL}/parents/students/${studentId}/memory/${factId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadMemory(); // Reload after delete
    } catch (error) {
      console.error('Error deleting fact:', error);
      alert('Failed to delete memory fact');
    }
  };

  const clearAllMemory = async () => {
    try {
      const token = getToken();
      await axios.delete(
        `${API_URL}/parents/students/${studentId}/memory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowClearConfirm(false);
      loadMemory(); // Reload after clear
    } catch (error) {
      console.error('Error clearing memory:', error);
      alert('Failed to clear memory');
    }
  };

  const MemorySection = ({ title, emoji, facts, color, borderColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 border-2 ${borderColor} shadow-lg`}
    >
      <h4 className="font-bold text-xl mb-4 flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <span>{title}</span>
        {facts && facts.length > 0 && (
          <span className="ml-auto text-sm bg-white/50 px-3 py-1 rounded-full">
            {facts.length}
          </span>
        )}
      </h4>

      {facts && facts.length > 0 ? (
        <ul className="space-y-3">
          {facts.map((fact) => (
            <motion.li
              key={fact.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start justify-between gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{fact.fact_text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Learned {new Date(fact.learned_at).toLocaleDateString()}
                  {fact.added_by !== 'auto' && ` • Added by ${fact.added_by}`}
                  {fact.confidence_score < 1 && (
                    <span className="ml-2 text-amber-600">
                      (Confidence: {Math.round(fact.confidence_score * 100)}%)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => deleteFact(fact.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete this memory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-sm italic bg-white/50 rounded-lg p-4">
          No {title.toLowerCase()} recorded yet
        </p>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const totalFacts = Object.values(memory).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
        <h3 className="text-3xl font-bold mb-2">
          What inspir knows about {studentName || 'your student'}
        </h3>
        <p className="text-purple-100 text-lg">
          {totalFacts} memory {totalFacts === 1 ? 'fact' : 'facts'} stored
        </p>
        <p className="text-sm text-purple-200 mt-3">
          💡 These facts help personalize learning experiences. You can delete any fact at any time.
        </p>
      </div>

      {/* Memory Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemorySection
          title="Interests"
          emoji="🎯"
          facts={memory.interest}
          color="from-purple-50 to-purple-100"
          borderColor="border-purple-300"
        />

        <MemorySection
          title="Learning Goals"
          emoji="🎓"
          facts={memory.goal}
          color="from-blue-50 to-blue-100"
          borderColor="border-blue-300"
        />

        <MemorySection
          title="Learning Preferences"
          emoji="⚙️"
          facts={memory.preference}
          color="from-green-50 to-green-100"
          borderColor="border-green-300"
        />

        <MemorySection
          title="Learning Style"
          emoji="🎨"
          facts={memory.learning_style}
          color="from-cyan-50 to-cyan-100"
          borderColor="border-cyan-300"
        />

        <MemorySection
          title="Strengths"
          emoji="💪"
          facts={memory.strength}
          color="from-yellow-50 to-yellow-100"
          borderColor="border-yellow-300"
        />

        <MemorySection
          title="Challenges"
          emoji="🎯"
          facts={memory.challenge}
          color="from-orange-50 to-orange-100"
          borderColor="border-orange-300"
        />

        {memory.other.length > 0 && (
          <MemorySection
            title="Other"
            emoji="📝"
            facts={memory.other}
            color="from-gray-50 to-gray-100"
            borderColor="border-gray-300"
          />
        )}
      </div>

      {/* Clear All Button */}
      {totalFacts > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
          <p className="text-sm text-red-700 mb-4">
            Clearing all memory will remove all facts about {studentName || 'your student'}.
            This action cannot be undone.
          </p>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Clear All Memory
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Are you sure?
                </h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete all {totalFacts} memory facts about{' '}
                  {studentName || 'your student'}. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAllMemory}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
