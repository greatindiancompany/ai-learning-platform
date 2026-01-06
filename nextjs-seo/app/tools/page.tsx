import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { createServerClient } from '@/lib/supabase'
import { Sparkles, ArrowRight, Award } from 'lucide-react'

export const metadata = generatePageMetadata({
  title: '15 AI Study Tools - Flashcards, Quiz Generator & More',
  description: 'Explore 15 AI-powered study tools including quiz generator, flashcards, study timer, math solver, and more. All in one platform.',
  keywords: ['study tools', 'AI tools', 'student tools', 'learning tools'],
  canonical: 'https://inspir.uk/tools',
})

// Tool icons mapping
const toolIcons: { [key: string]: string } = {
  'quiz-generator': '📝',
  'flashcards': '🃏',
  'study-timer': '⏰',
  'practice-tests': '📊',
  'habit-tracker': '✅',
  'ai-tutor': '💡',
  'study-music': '🎵',
  'image-analysis': '📸',
  'math-solver': '🧮',
  'science-lab': '🔬',
  'visual-learning': '🌍',
  'notes-sync': '📓',
  'ai-planner': '📅',
  'goal-setter': '🎯',
  'draw-sketch': '🎨',
}

export default async function ToolsPage() {
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('seo_tool_pages')
    .select('*')
    .order('title')

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              All 15 Tools Included
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900 dark:text-white">
              AI-Powered Study Tools
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to study smarter, all in one beautifully designed platform. From quiz generators to study timers, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools?.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-400"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {toolIcons[tool.slug] || '🛠️'}
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <span className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
              Why Use inspir Tools?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Designed specifically for students, powered by cutting-edge AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-Powered',
                desc: 'All tools use Claude AI for intelligent assistance',
              },
              {
                title: 'All-in-One',
                desc: 'No switching between apps, everything in one place',
              },
              {
                title: 'Always Free',
                desc: '14-day trial, then just £4.99/month for all tools',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-6">
            All Tools Included in Free Trial
          </h2>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Start your 14-day free trial and get instant access to all 15 tools. No credit card required.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            Start Free Trial
            <Sparkles className="w-5 h-5" />
          </Link>
          <p className="text-sm text-purple-100 mt-4">
            No credit card required • Cancel anytime • All 15 tools
          </p>
        </div>
      </section>
    </main>
  )
}
