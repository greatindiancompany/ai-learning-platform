import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL, { chatClient, chatAuthHeaders } from '../utils/api';

// Import components
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import RightSidebar from '../components/chat/RightSidebar';
import ToolbarIcon from '../components/chat/ToolbarIcon';
import ToolModal from '../components/chat/ToolModal';

export default function Chat() {
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeToolId, setActiveToolId] = useState(null);

  // User preferences
  const [ageFilter, setAgeFilter] = useState('teen');
  const [currentSubject, setCurrentSubject] = useState('General');
  const [studyStreak, setStudyStreak] = useState(5);
  const [todayStudyTime, setTodayStudyTime] = useState(135);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const listRequest = useRef(0);

  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // 15 Revolutionary Study Tools
  const tools = [
    { id: 'draw', icon: '🎨', label: 'Draw/Sketch', description: 'Visual learning canvas', gradient: 'from-blue-500 to-green-500' },
    { id: 'quiz', icon: '📝', label: 'Quiz Generator', description: 'Create instant quizzes', gradient: 'from-purple-500 to-pink-500' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards', description: 'Study with flashcards', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'practice', icon: '📊', label: 'Practice Tests', description: 'Full practice tests', gradient: 'from-blue-500 to-indigo-500' },
    { id: 'timer', icon: '⏰', label: 'Study Timer', description: 'Pomodoro timer', gradient: 'from-red-500 to-pink-500' },
    { id: 'habits', icon: '✅', label: 'Habit Tracker', description: 'Track study habits', gradient: 'from-green-500 to-teal-500' },
    { id: 'explain', icon: '💡', label: 'Explain Concept', description: 'Deep explanations', gradient: 'from-yellow-400 to-yellow-600' },
    { id: 'music', icon: '🎵', label: 'Study Music', description: 'Focus music', gradient: 'from-purple-400 to-purple-600' },
    { id: 'image', icon: '📸', label: 'Image Analysis', description: 'Homework help', gradient: 'from-blue-400 to-cyan-500' },
    { id: 'math', icon: '🧮', label: 'Math Solver', description: 'Step-by-step math', gradient: 'from-indigo-500 to-blue-500' },
    { id: 'science', icon: '🔬', label: 'Science Lab', description: 'Experiments & simulations', gradient: 'from-green-400 to-emerald-500' },
    { id: 'visual', icon: '🌍', label: 'Visual Learning', description: 'Diagrams & maps', gradient: 'from-blue-500 to-green-400' },
    { id: 'notes', icon: '📓', label: 'Notes Sync', description: 'Cornell notes', gradient: 'from-amber-600 to-orange-600' },
    { id: 'planner', icon: '📅', label: 'AI Planner', description: 'Smart scheduling', gradient: 'from-violet-500 to-purple-500' },
    { id: 'goals', icon: '🎯', label: 'Goal Setter', description: 'Track progress', gradient: 'from-red-500 to-rose-500' }
  ];

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [inputMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    const requestId = ++listRequest.current;
    try {
      const response = await chatClient.get('/chat/conversations');
      if (requestId !== listRequest.current) return;
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createNewConversation = async () => {
    listRequest.current += 1;
    try {
      const response = await chatClient.post('/chat/conversations', {
        title: 'New Chat'
      });
      const newConv = response.data;
      setConversations(prev => [newConv, ...prev.filter((conversation) => conversation.id !== newConv.id)]);
      setCurrentConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatClient.get(`/chat/conversations/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
    setStreamingMessage('');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    let conversation = currentConversation;
    if (!conversation) {
      const newConv = await createNewConversation();
      if (!newConv) return;
      conversation = newConv;
    }

    const userMessage = inputMessage.trim();

    setInputMessage('');
    setIsStreaming(true);
    setStreamingMessage('');

    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Prepare request body
      const requestBody = {
        content: userMessage,
        ageFilter
      };

      const response = await fetch(
        `${API_URL}/chat/conversations/${conversation.id}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: chatAuthHeaders({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content') {
                fullText += data.text;
                setStreamingMessage(fullText);
              } else if (data.type === 'done') {
                const assistantMsg = {
                  id: data.messageId,
                  role: 'assistant',
                  content: fullText,
                  created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, assistantMsg]);
                setStreamingMessage('');
                loadConversations();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle paste from clipboard
  // Handle voice input
  const toggleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();

          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');

            setInputMessage(transcript);
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognition.start();
          setMediaRecorder(recognition);
          setIsRecording(true);
        } else {
          alert('Voice input not supported in this browser. Please use Chrome or Edge.');
        }
      } catch (error) {
        console.error('Error starting voice input:', error);
        alert('Could not start voice input. Please check microphone permissions.');
      }
    }
  };

  // Regenerate response (called when user clicks thumbs down)
  const regenerateResponse = async (messageId) => {
    try {
      // Find the message and its index
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Remove the AI response and any messages after it
      const messagesToKeep = messages.slice(0, messageIndex);
      setMessages(messagesToKeep);

      // Get the last user message
      const lastUserMessage = [...messagesToKeep]
        .reverse()
        .find(m => m.role === 'user');

      if (!lastUserMessage) return;

      setIsStreaming(true);
      setStreamingMessage('');

      const response = await fetch(
        `${API_URL}/chat/conversations/${currentConversation.id}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: chatAuthHeaders({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            content: lastUserMessage.content,
            ageFilter,
            isRegeneration: true,
            previousResponseId: messageId
          })
        }
      );

      if (!response.ok) throw new Error('Failed to regenerate message');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content') {
                fullText += data.text;
                setStreamingMessage(fullText);
              } else if (data.type === 'done') {
                const assistantMsg = {
                  id: data.messageId,
                  role: 'assistant',
                  content: fullText,
                  created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, assistantMsg]);
                setStreamingMessage('');
                loadConversations();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      alert('Failed to regenerate message. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const deleteConversation = async (convId) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await chatClient.delete(`/chat/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversation?.id === convId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden relative">
      {/* MAIN CHAT AREA - LEFT SIDE (Revolutionary Design!) */}
      <motion.div
        className="flex-1 flex flex-col relative bg-gradient-to-br from-white to-purple-50/30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Chat Header */}
        <ChatHeader
          currentSubject={currentSubject}
          ageFilter={ageFilter}
          studyStreak={studyStreak}
          todayStudyTime={todayStudyTime}
          onSubjectChange={setCurrentSubject}
          onAgeFilterChange={setAgeFilter}
        />

        {currentConversation ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-3" style={{ paddingBottom: '160px' }}>
              <div className="max-w-7xl mx-auto">
                {messages.length === 0 && !streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 px-4"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 flex items-center justify-center"
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span className="text-3xl">✨</span>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      How can I help you today?
                    </h2>
                    <p className="text-gray-600 text-base">
                      Ask me anything - I'm here to help you learn!
                    </p>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    index={idx}
                    onRegenerate={regenerateResponse}
                  />
                ))}

                {/* Streaming message */}
                {streamingMessage && (
                  <MessageBubble
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingMessage,
                      created_at: new Date().toISOString()
                    }}
                    isStreaming={true}
                    onRegenerate={regenerateResponse}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom above toolbar */}
            <div className="absolute bottom-20 left-0 right-0 bg-transparent pt-3 pb-3 px-3 z-[90]">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  className={`relative bg-white border-2 shadow-lg transition-all ${
                    inputMessage.length > 0 || isStreaming
                      ? 'border-gray-300 rounded-2xl px-3 py-2'
                      : 'border-gray-200 rounded-[28px] px-2.5 py-2'
                  } focus-within:border-blue-400 focus-within:shadow-xl`}
                  animate={{
                    borderRadius: inputMessage.length > 0 || isStreaming ? '16px' : '28px'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1.5">
                    {/* Left actions */}
                    <div className="flex gap-0.5 items-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleVoiceInput}
                        className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center w-8 h-8 ${
                          isRecording ? 'text-red-600 bg-red-50' : 'text-gray-600'
                        }`}
                        title={isRecording ? 'Stop recording' : 'Voice input'}
                        type="button"
                      >
                        {isRecording ? (
                          // Stop icon
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <rect x="6" y="6" width="12" height="12" rx="2"/>
                          </svg>
                        ) : (
                          // Microphone icon
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                        )}
                      </motion.button>
                    </div>

                    {/* Textarea */}
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        disabled={isStreaming}
                        rows={1}
                        className="w-full resize-none bg-transparent border-none focus:outline-none text-[15px] leading-6 text-gray-900 placeholder-gray-500 px-0 py-0 disabled:opacity-50"
                        style={{
                          maxHeight: '120px',
                          minHeight: '24px',
                          lineHeight: '24px'
                        }}
                      />
                    </div>

                    {/* Send button */}
                    <motion.button
                      onClick={sendMessage}
                      disabled={isStreaming || !inputMessage.trim()}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 flex items-center justify-center transition-all text-2xl ${
                        inputMessage.trim() && !isStreaming
                          ? 'opacity-100 cursor-pointer'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                      type="button"
                    >
                      🚀
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4" style={{ paddingBottom: '140px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 10px 30px rgba(124, 58, 237, 0.3)',
                    '0 10px 40px rgba(124, 58, 237, 0.5)',
                    '0 10px 30px rgba(124, 58, 237, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-5xl">✨</span>
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                inspir AI
              </h1>
              <p className="text-gray-600 text-xl mb-8">
                Your revolutionary AI study companion
              </p>
              <motion.button
                onClick={createNewConversation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white rounded-2xl hover:from-purple-700 hover:via-blue-700 hover:to-green-700 transition-all font-semibold text-lg shadow-xl"
              >
                Start Learning Now
              </motion.button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* RIGHT SIDEBAR - Navigation & Organization (Revolutionary Design!) */}
      <RightSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={createNewConversation}
        studyStreak={studyStreak}
        todayStudyTime={todayStudyTime}
      />

      {/* BOTTOM TOOLBAR - 15 Revolutionary Tools (Revolutionary Design!) */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-[100]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex items-center justify-center gap-4 px-4 overflow-x-auto">
          {tools.map((tool, index) => (
            <ToolbarIcon
              key={tool.id}
              tool={tool}
              index={index}
              isActive={activeToolId === tool.id}
              onClick={() => setActiveToolId(tool.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Tool Modal */}
      <AnimatePresence>
        {activeToolId && (
          <ToolModal
            tool={tools.find(t => t.id === activeToolId)}
            onClose={() => setActiveToolId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
