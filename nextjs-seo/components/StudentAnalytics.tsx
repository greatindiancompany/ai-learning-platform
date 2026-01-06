'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, Smartphone, Globe, TrendingUp, Activity } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://inspir.uk/api'

interface Session {
  id: string
  session_token: string
  device_type: string
  browser: string
  time_of_day: string
  day_of_week: string
  started_at: string
  ended_at: string | null
  session_duration_seconds: number | null
  messages_sent: number
  tools_used: string[]
}

interface Analytics {
  active_days_last_7: number
  avg_messages_per_session: number
  most_used_tools: string[]
  preferred_subjects: string[]
  total_session_time: number
  most_active_time: string
  most_active_day: string
}

interface StudentAnalyticsProps {
  studentId: string
  studentName: string
}

export default function StudentAnalytics({ studentId, studentName }: StudentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      loadAnalytics()
    }
  }, [studentId])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('parent_token')
      const response = await fetch(`${API_URL}/parents/students/${studentId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to load analytics')

      const data = await response.json()
      setAnalytics(data.analytics)
      setSessions(data.recent_sessions || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0m'
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-inspir-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <h3 className="text-3xl font-bold mb-2">
          {studentName}'s Learning Analytics
        </h3>
        <p className="text-blue-100 text-lg">
          Insights into study patterns and engagement
        </p>
      </div>

      {analytics ? (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Active Days</h4>
              </div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {analytics.active_days_last_7}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 7 days</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Avg Messages</h4>
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(analytics.avg_messages_per_session || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per session</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Total Time</h4>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {formatDuration(analytics.total_session_time)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Study time</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h4 className="font-bold text-xl text-gray-900 dark:text-white">Study Patterns</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    Most Active Time
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white capitalize">
                    {analytics.most_active_time || 'Not enough data'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    Most Active Day
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {analytics.most_active_day || 'Not enough data'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h4 className="font-bold text-xl text-gray-900 dark:text-white">Most Used Tools</h4>
              </div>
              {analytics.most_used_tools && analytics.most_used_tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.most_used_tools.map((tool, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-inspir-purple/10 text-inspir-purple dark:bg-inspir-purple/20 dark:text-purple-300 rounded-full text-sm font-semibold"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">No tools used yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
          <Activity className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No analytics data yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics will appear once {studentName} starts using inspir
          </p>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h4 className="font-bold text-xl text-gray-900 dark:text-white">Recent Sessions</h4>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-inspir-purple to-inspir-blue flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {session.day_of_week} {session.time_of_day}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.started_at).toLocaleString()} • {session.device_type} • {session.browser}
                    </p>
                    {session.tools_used && session.tools_used.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Tools: {session.tools_used.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {session.messages_sent || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">messages</p>
                  {session.session_duration_seconds && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDuration(session.session_duration_seconds)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 italic text-center py-8">
            No sessions recorded yet
          </p>
        )}
      </div>
    </div>
  )
}
