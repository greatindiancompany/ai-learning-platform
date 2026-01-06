'use client'

import { useState, useEffect } from 'react'
import { Trash2, Brain, Target, Settings, Palette, Zap, AlertCircle, FileText } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inspir.uk/api'

interface MemoryFact {
  id: string
  fact_type: string
  fact_text: string
  learned_at: string
  added_by: string
  confidence_score: number
  use_count: number
  last_used_at: string | null
}

interface GroupedMemory {
  interest: MemoryFact[]
  goal: MemoryFact[]
  preference: MemoryFact[]
  learning_style: MemoryFact[]
  strength: MemoryFact[]
  challenge: MemoryFact[]
  other: MemoryFact[]
}

interface StudentMemoryViewProps {
  studentId: string
  studentName: string
}

export default function StudentMemoryView({ studentId, studentName }: StudentMemoryViewProps) {
  const [memory, setMemory] = useState<GroupedMemory>({
    interest: [],
    goal: [],
    preference: [],
    learning_style: [],
    strength: [],
    challenge: [],
    other: []
  })
  const [loading, setLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    if (studentId) {
      loadMemory()
    }
  }, [studentId])

  const loadMemory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('parent_token')
      const response = await fetch(`${API_URL}/parents/students/${studentId}/memory`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to load memory')

      const data = await response.json()

      // Group by type
      const grouped: GroupedMemory = {
        interest: [],
        goal: [],
        preference: [],
        learning_style: [],
        strength: [],
        challenge: [],
        other: []
      }

      data.memory.forEach((fact: MemoryFact) => {
        const type = fact.fact_type || 'other'
        if (grouped[type as keyof GroupedMemory]) {
          grouped[type as keyof GroupedMemory].push(fact)
        } else {
          grouped.other.push(fact)
        }
      })

      setMemory(grouped)
    } catch (error) {
      console.error('Error loading memory:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFact = async (factId: string) => {
    if (!confirm('Delete this memory fact?')) return

    try {
      const token = localStorage.getItem('parent_token')
      const response = await fetch(`${API_URL}/parents/students/${studentId}/memory/${factId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete fact')

      loadMemory()
    } catch (error) {
      console.error('Error deleting fact:', error)
      alert('Failed to delete memory fact')
    }
  }

  const clearAllMemory = async () => {
    try {
      const token = localStorage.getItem('parent_token')
      const response = await fetch(`${API_URL}/parents/students/${studentId}/memory`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to clear memory')

      setShowClearConfirm(false)
      loadMemory()
    } catch (error) {
      console.error('Error clearing memory:', error)
      alert('Failed to clear memory')
    }
  }

  const sections = [
    { key: 'interest', title: 'Interests', emoji: '🎯', icon: Target, color: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', borderColor: 'border-purple-300 dark:border-purple-700' },
    { key: 'goal', title: 'Learning Goals', emoji: '🎓', icon: Brain, color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', borderColor: 'border-blue-300 dark:border-blue-700' },
    { key: 'preference', title: 'Learning Preferences', emoji: '⚙️', icon: Settings, color: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', borderColor: 'border-green-300 dark:border-green-700' },
    { key: 'learning_style', title: 'Learning Style', emoji: '🎨', icon: Palette, color: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20', borderColor: 'border-cyan-300 dark:border-cyan-700' },
    { key: 'strength', title: 'Strengths', emoji: '💪', icon: Zap, color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20', borderColor: 'border-yellow-300 dark:border-yellow-700' },
    { key: 'challenge', title: 'Challenges', emoji: '🎯', icon: AlertCircle, color: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20', borderColor: 'border-orange-300 dark:border-orange-700' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-inspir-purple"></div>
      </div>
    )
  }

  const totalFacts = Object.values(memory).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
        <h3 className="text-3xl font-bold mb-2">
          What inspir knows about {studentName}
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
        {sections.map((section) => {
          const facts = memory[section.key as keyof GroupedMemory]
          const Icon = section.icon

          return (
            <div
              key={section.key}
              className={`bg-gradient-to-br ${section.color} rounded-xl p-6 border-2 ${section.borderColor} shadow-lg`}
            >
              <h4 className="font-bold text-xl mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
                <Icon className="w-6 h-6" />
                <span>{section.title}</span>
                {facts && facts.length > 0 && (
                  <span className="ml-auto text-sm bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                    {facts.length}
                  </span>
                )}
              </h4>

              {facts && facts.length > 0 ? (
                <ul className="space-y-3">
                  {facts.map((fact) => (
                    <li
                      key={fact.id}
                      className="flex items-start justify-between gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{fact.fact_text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Learned {new Date(fact.learned_at).toLocaleDateString()}
                          {fact.use_count > 0 && ` • Used ${fact.use_count} times`}
                          {fact.confidence_score < 1 && (
                            <span className="ml-2 text-amber-600">
                              (Confidence: {Math.round(fact.confidence_score * 100)}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteFact(fact.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        title="Delete this memory"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm italic bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  No {section.title.toLowerCase()} recorded yet
                </p>
              )}
            </div>
          )
        })}

        {memory.other.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700 shadow-lg">
            <h4 className="font-bold text-xl mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
              <FileText className="w-6 h-6" />
              <span>Other</span>
              <span className="ml-auto text-sm bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                {memory.other.length}
              </span>
            </h4>
            <ul className="space-y-3">
              {memory.other.map((fact) => (
                <li
                  key={fact.id}
                  className="flex items-start justify-between gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{fact.fact_text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Learned {new Date(fact.learned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteFact(fact.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {totalFacts > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
          <h4 className="font-bold text-red-900 dark:text-red-300 mb-2">Danger Zone</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Clearing all memory will remove all facts about {studentName}. This action cannot be undone.
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
      {showClearConfirm && (
        <>
          <div
            onClick={() => setShowClearConfirm(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Are you sure?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will permanently delete all {totalFacts} memory facts about {studentName}. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          </div>
        </>
      )}
    </div>
  )
}
