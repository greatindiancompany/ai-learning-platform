import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { habitsApi } from '../../utils/toolsApi';
import { Plus, Check, Flame } from 'lucide-react';

export default function HabitTrackerTool() {
  const [habits, setHabits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', frequency: 'daily', target_count: 1 });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await habitsApi.getAll();
      setHabits(response.data.habits || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const createHabit = async () => {
    if (!newHabit.name.trim()) return;
    try {
      await habitsApi.create(newHabit);
      setNewHabit({ name: '', description: '', frequency: 'daily', target_count: 1 });
      setShowAddForm(false);
      loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const completeHabit = async (habitId) => {
    try {
      await habitsApi.complete({ habit_id: habitId, notes: '' });
      loadHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Habit Tracker</h2>
          <p className="text-gray-600">Build consistent study habits</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          New Habit
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-6 shadow-lg"
        >
          <h3 className="font-bold text-lg mb-4">Create New Habit</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Habit name (e.g., 'Read for 30 minutes')"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <select
                value={newHabit.frequency}
                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Target count"
                value={newHabit.target_count}
                onChange={(e) => setNewHabit({ ...newHabit, target_count: parseInt(e.target.value) })}
                className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createHabit}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                Create Habit
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

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No habits yet. Create your first one!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <motion.div
              key={habit.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-gray-600 text-sm mt-1">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="capitalize">{habit.frequency}</span>
                    <span>Target: {habit.target_count}x</span>
                    {habit.completions && habit.completions[0]?.count > 0 && (
                      <div className="flex items-center gap-1 text-orange-600 font-semibold">
                        <Flame className="w-4 h-4" />
                        {habit.completions[0].count} completions
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => completeHabit(habit.id)}
                  className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
                >
                  <Check className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
