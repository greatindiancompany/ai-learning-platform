import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { visualApi } from '../../utils/toolsApi';
import { Plus, Map, Lightbulb, Network, Edit3, Trash2 } from 'lucide-react';

const visualTypes = [
  { id: 'mind-map', label: 'Mind Map', icon: '🧠', description: 'Brainstorm and connect ideas' },
  { id: 'flowchart', label: 'Flowchart', icon: '📊', description: 'Process diagrams and workflows' },
  { id: 'concept-map', label: 'Concept Map', icon: '🔗', description: 'Connect related concepts' },
  { id: 'diagram', label: 'Diagram', icon: '📐', description: 'Visual explanations' }
];

export default function VisualLearningTool() {
  const [visuals, setVisuals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVisual, setNewVisual] = useState({
    title: '',
    type: 'mind-map',
    content: '',
    subject: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadVisuals();
  }, []);

  const loadVisuals = async () => {
    try {
      const response = await visualApi.getAll();
      setVisuals(response.data.visuals || []);
    } catch (error) {
      console.error('Error loading visuals:', error);
    }
  };

  const createVisual = async () => {
    if (!newVisual.title.trim() || !newVisual.content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    try {
      await visualApi.create(newVisual);
      setNewVisual({ title: '', type: 'mind-map', content: '', subject: '' });
      setShowAddForm(false);
      loadVisuals();
    } catch (error) {
      console.error('Error creating visual:', error);
    }
  };

  const updateVisual = async (id, updates) => {
    try {
      await visualApi.update(id, updates);
      setEditingId(null);
      loadVisuals();
    } catch (error) {
      console.error('Error updating visual:', error);
    }
  };

  const getTypeInfo = (type) => {
    return visualTypes.find(t => t.id === type) || visualTypes[0];
  };

  const formatContent = (content) => {
    // Simple formatting: convert line breaks to list items
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          // Check if line starts with -, *, or bullet point
          const isBullet = trimmed.match(/^[-*•]/);
          const text = isBullet ? trimmed.substring(1).trim() : trimmed;

          return (
            <div key={idx} className={`flex items-start gap-2 ${isBullet ? 'ml-4' : ''}`}>
              {isBullet && <span className="text-purple-500 mt-1">•</span>}
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Visual Learning</h2>
          <p className="text-gray-600">Mind maps, diagrams, and visual aids</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          New Visual
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-6 shadow-lg"
        >
          <h3 className="font-bold text-lg mb-4">Create Visual Learning Aid</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g., 'Photosynthesis Process')"
              value={newVisual.title}
              onChange={(e) => setNewVisual({ ...newVisual, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={newVisual.type}
                onChange={(e) => setNewVisual({ ...newVisual, type: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                {visualTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Subject (optional)"
                value={newVisual.subject}
                onChange={(e) => setNewVisual({ ...newVisual, subject: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content (use - or * for bullet points)
              </label>
              <textarea
                placeholder="Enter your visual content here...&#10;- Main concept 1&#10;  - Sub-point A&#10;  - Sub-point B&#10;- Main concept 2"
                value={newVisual.content}
                onChange={(e) => setNewVisual({ ...newVisual, content: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                rows="8"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Start lines with - or * to create bullet points
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createVisual}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                Create Visual
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visuals.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No visual learning aids yet. Create your first one!</p>
          </div>
        ) : (
          visuals.map((visual) => {
            const typeInfo = getTypeInfo(visual.type);
            const isEditing = editingId === visual.id;

            return (
              <motion.div
                key={visual.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{visual.title}</h3>
                        <p className="text-xs text-gray-500">{typeInfo.label}</p>
                      </div>
                    </div>
                    {visual.subject && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {visual.subject}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(isEditing ? null : visual.id)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      defaultValue={visual.content}
                      onChange={(e) => {
                        // Store the new content temporarily
                        visual._newContent = e.target.value;
                      }}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                      rows="6"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateVisual(visual.id, {
                            title: visual.title,
                            content: visual._newContent || visual.content,
                            subject: visual.subject
                          });
                        }}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-purple-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 mt-3">
                    {formatContent(visual.content)}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Updated: {new Date(visual.updated_at).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Visual Types Guide */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Visual Learning Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visualTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl mb-2">{type.icon}</div>
              <h4 className="font-bold text-sm text-gray-800 mb-1">{type.label}</h4>
              <p className="text-xs text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
