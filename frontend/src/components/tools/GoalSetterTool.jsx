import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { goalsApi } from '../../utils/toolsApi';
import { Plus, Target, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function GoalSetterTool() {
  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'academic', target_date: '' });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsApi.getAll();
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) return;
    try {
      await goalsApi.create(newGoal);
      setNewGoal({ title: '', description: '', category: 'academic', target_date: '' });
      setShowAddForm(false);
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateProgress = async (goalId, newProgress) => {
    try {
      const status = newProgress >= 100 ? 'completed' : 'active';
      await goalsApi.updateProgress(goalId, { progress: newProgress, status });
      loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    if (progress < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Goal Setter</h2>
          <p className="text-gray-600">Track your progress towards success</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-6 shadow-lg"
        >
          <h3 className="font-bold text-lg mb-4">Create New Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal title (e.g., 'Get an A in Math')"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
            />
            <textarea
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none resize-none"
              rows="3"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
              >
                <option value="academic">Academic</option>
                <option value="personal">Personal</option>
                <option value="skill">Skill Development</option>
              </select>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createGoal}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                Create Goal
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

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No goals yet. Set your first goal!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-gray-800">{goal.title}</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full capitalize">
                      {goal.category}
                    </span>
                    {goal.status === 'completed' && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <p className="text-sm text-gray-500">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-2xl font-bold text-gray-800">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className={`h-full ${getProgressColor(goal.progress)} transition-all`}
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-4">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                  className="flex-1"
                />
              </div>

              {/* Milestones */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Milestones:</p>
                  <div className="space-y-1">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          readOnly
                          className="w-4 h-4"
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
