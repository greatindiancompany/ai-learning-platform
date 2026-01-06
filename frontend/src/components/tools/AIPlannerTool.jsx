import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { plannerApi } from '../../utils/toolsApi';
import { Plus, Calendar, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export default function AIPlannerTool() {
  const [plans, setPlans] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    start_date: '',
    end_date: '',
    subjects: [],
    schedule: {}
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [tasks, setTasks] = useState({});
  const [expandedPlan, setExpandedPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await plannerApi.getPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadTasksForPlan = async (planId) => {
    try {
      const response = await plannerApi.getTasks(planId);
      setTasks(prev => ({ ...prev, [planId]: response.data.tasks || [] }));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const createPlan = async () => {
    if (!newPlan.title.trim() || !newPlan.start_date || !newPlan.end_date) {
      alert('Please fill in title and dates');
      return;
    }
    try {
      // Ensure schedule is a valid JSON object
      const planData = {
        ...newPlan,
        schedule: newPlan.schedule || {}
      };
      await plannerApi.createPlan(planData);
      setNewPlan({ title: '', start_date: '', end_date: '', subjects: [], schedule: {} });
      setSubjectInput('');
      setShowAddForm(false);
      loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error creating plan. Please try again.');
    }
  };

  const addSubject = () => {
    if (subjectInput.trim() && !newPlan.subjects.includes(subjectInput.trim())) {
      setNewPlan({
        ...newPlan,
        subjects: [...newPlan.subjects, subjectInput.trim()]
      });
      setSubjectInput('');
    }
  };

  const removeSubject = (subject) => {
    setNewPlan({
      ...newPlan,
      subjects: newPlan.subjects.filter(s => s !== subject)
    });
  };

  const togglePlan = (planId) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
      if (!tasks[planId]) {
        loadTasksForPlan(planId);
      }
    }
  };

  const completeTask = async (taskId, planId) => {
    try {
      await plannerApi.completeTask(taskId);
      loadTasksForPlan(planId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">AI Study Planner</h2>
          <p className="text-gray-600">Smart schedule generation for your goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-6 shadow-lg"
        >
          <h3 className="font-bold text-lg mb-4">Create Study Plan</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Plan title (e.g., 'Final Exams Prep')"
              value={newPlan.title}
              onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newPlan.start_date}
                  onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newPlan.end_date}
                  onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subjects</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a subject"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={addSubject}
                  className="px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newPlan.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {subject}
                    <button
                      onClick={() => removeSubject(subject)}
                      className="text-blue-900 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={createPlan}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                Create Plan
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

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No study plans yet. Create your first one!</p>
          </div>
        ) : (
          plans.map((plan) => {
            const daysLeft = getDaysRemaining(plan.end_date);
            const isExpanded = expandedPlan === plan.id;
            const planTasks = tasks[plan.id] || [];
            const completedCount = planTasks.filter(t => t.completed).length;
            const totalCount = planTasks.length;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-all shadow-sm"
              >
                <div
                  onClick={() => togglePlan(plan.id)}
                  className="p-5 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800 mb-2">{plan.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(plan.subjects || []).map((subject) => (
                          <span
                            key={subject}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`text-right ${daysLeft < 7 ? 'text-red-600' : 'text-gray-600'}`}>
                      <div className="text-2xl font-bold">{daysLeft}</div>
                      <div className="text-xs">days left</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                    </div>
                    {totalCount > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {completedCount}/{totalCount} tasks
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-200 bg-gray-50 p-5"
                  >
                    {planTasks.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks for this plan yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {planTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              task.completed ? 'bg-green-50' : 'bg-white'
                            }`}
                          >
                            <button
                              onClick={() => !task.completed && completeTask(task.id, plan.id)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                task.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-purple-500'
                              }`}
                            >
                              {task.completed && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.due_date && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {formatDate(task.due_date)}
                                </p>
                              )}
                            </div>
                            {task.subject && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                {task.subject}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
