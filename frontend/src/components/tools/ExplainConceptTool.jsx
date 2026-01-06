import { useState } from 'react';
import { motion } from 'framer-motion';
import { getToken } from '../../utils/auth';

export default function ExplainConceptTool() {
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExplanation('');

    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // First, create a conversation
      const convResponse = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });

      if (!convResponse.ok) {
        throw new Error('Failed to create conversation');
      }

      const convData = await convResponse.json();
      const conversationId = convData.conversation.id;

      // Then send the message with SSE streaming
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          content: `Please explain the concept of "${concept}" in depth. Include:
1. A clear definition
2. Key components and principles
3. Real-world examples
4. Common misconceptions
5. How it relates to other concepts

Make it educational and easy to understand.`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content' && data.text) {
                fullText += data.text;
                setExplanation(fullText);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to get explanation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Explain Any Concept</h2>
          <p className="text-gray-600">Get deep, educational explanations powered by AI</p>
        </div>

        <form onSubmit={handleExplain} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What concept would you like explained?
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Photosynthesis, Quantum Mechanics, The French Revolution"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !concept.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating explanation...
              </span>
            ) : (
              '💡 Explain This Concept'
            )}
          </button>
        </form>

        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="text-xl font-bold text-gray-800">{concept}</h3>
            </div>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {explanation}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
