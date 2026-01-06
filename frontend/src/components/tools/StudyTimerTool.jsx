import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { timerApi } from '../../utils/toolsApi';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export default function StudyTimerTool() {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [subject, setSubject] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  const intervalRef = useRef(null);

  useEffect(() => {
    loadTodaySessions();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const loadTodaySessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await timerApi.getSessions(today);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startTimer = async () => {
    if (!isRunning) {
      try {
        const response = await timerApi.start({
          task_name: taskName || 'Study Session',
          subject,
          duration_minutes: duration
        });
        setSessionId(response.data.session.id);
        setIsRunning(true);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setSessionId(null);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await timerApi.complete(sessionId);
        loadTodaySessions();
        // Play sound or show notification
        alert('Session complete! Great work! 🎉');
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
    resetTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalMinutesToday = sessions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Study Timer</h2>
        <p className="text-gray-600">Pomodoro technique for focused study</p>
      </div>

      {/* Timer Display */}
      <motion.div
        className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl p-12 text-center mb-6 shadow-2xl"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-white text-7xl font-bold mb-4">
          {formatTime(timeLeft)}
        </div>
        <div className="text-white text-opacity-90 text-lg">
          {isRunning ? 'Focus Time 🎯' : 'Ready to start?'}
        </div>
      </motion.div>

      {/* Task Input */}
      {!isRunning && (
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
      )}

      {/* Duration Presets */}
      {!isRunning && (
        <div className="flex gap-3 mb-6">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setDuration(mins);
                setTimeLeft(mins * 60);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                duration === mins
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 mb-8">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTimer}
            className="flex-1 bg-green-500 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-green-600"
          >
            <Play className="w-6 h-6" />
            Start
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={pauseTimer}
            className="flex-1 bg-yellow-500 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-yellow-600"
          >
            <Pause className="w-6 h-6" />
            Pause
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-300"
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Today's Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Today's Study Time</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{totalMinutesToday} min</span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {sessions.filter(s => s.completed).length} sessions completed
        </div>
      </div>
    </div>
  );
}
