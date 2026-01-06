import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/structured-data'
import StructuredData from '@/components/seo/StructuredData'
import {
  Sparkles, BookOpen, Brain, Clock, CheckCircle2,
  Users, TrendingUp, Award, ArrowRight, Star,
  Zap, Target, Shield, GraduationCap, Building2,
  UserPlus, LogIn, Heart, Globe
} from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'inspir - AI Study Platform | Sponsor a Student Today',
  description: 'Revolutionary AI study platform with 15 tools. £6.99/profile. Parents, schools and organizations can sponsor students. Start transforming education today.',
  keywords: ['AI tutor', 'study platform', 'homework help', 'sponsor education', 'student sponsorship'],
  canonical: 'https://inspir.uk',
  ogImage: '/images/mission-1.jpg',
})

const allTools = [
  { name: 'Quiz Generator', desc: 'Create custom quizzes instantly', icon: '📝', color: 'from-purple-500 to-pink-500' },
  { name: 'Flashcards', desc: 'Study with smart flashcards', icon: '🃏', color: 'from-yellow-500 to-orange-500' },
  { name: 'Study Timer', desc: 'Pomodoro & focus timers', icon: '⏰', color: 'from-red-500 to-pink-500' },
  { name: 'Practice Tests', desc: 'Full-length practice exams', icon: '📊', color: 'from-blue-500 to-indigo-500' },
  { name: 'Habit Tracker', desc: 'Build consistent study habits', icon: '✅', color: 'from-green-500 to-teal-500' },
  { name: 'AI Tutor', desc: 'Get instant homework help', icon: '💡', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Study Music', desc: 'Focus-enhancing playlists', icon: '🎵', color: 'from-purple-400 to-purple-600' },
  { name: 'Image Analysis', desc: 'Upload & analyze homework', icon: '📸', color: 'from-blue-400 to-cyan-500' },
  { name: 'Math Solver', desc: 'Step-by-step solutions', icon: '🧮', color: 'from-indigo-500 to-blue-500' },
  { name: 'Science Lab', desc: 'Virtual experiments', icon: '🔬', color: 'from-green-400 to-emerald-500' },
  { name: 'Visual Learning', desc: 'Mind maps & diagrams', icon: '🌍', color: 'from-blue-500 to-green-400' },
  { name: 'Notes Sync', desc: 'Cornell note-taking', icon: '📓', color: 'from-amber-600 to-orange-600' },
  { name: 'AI Planner', desc: 'Smart study schedules', icon: '📅', color: 'from-violet-500 to-purple-500' },
  { name: 'Goal Setter', desc: 'Track your progress', icon: '🎯', color: 'from-red-500 to-rose-500' },
  { name: 'Draw/Sketch', desc: 'Visual brainstorming', icon: '🎨', color: 'from-blue-500 to-green-500' },
]

const benefits = [
  {
    icon: <Brain className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
    title: 'AI-Powered Learning',
    description: 'Get personalized help from Claude AI, the most advanced AI tutor available.'
  },
  {
    icon: <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
    title: 'Instant Answers',
    description: 'No more waiting. Get immediate explanations for any homework question.'
  },
  {
    icon: <Target className="w-12 h-12 text-green-600 dark:text-green-400" />,
    title: '15 Tools, One Platform',
    description: 'Everything you need to study effectively, all in one beautifully designed app.'
  },
  {
    icon: <Shield className="w-12 h-12 text-orange-600 dark:text-orange-400" />,
    title: 'Safe & Private',
    description: 'Your data is encrypted and never shared. Study with complete peace of mind.'
  },
]

const stats = [
  { number: '15+', label: 'Study Tools', icon: <BookOpen className="w-6 h-6" /> },
  { number: '10K+', label: 'Students', icon: <Users className="w-6 h-6" /> },
  { number: '98%', label: 'Satisfaction', icon: <Star className="w-6 h-6" /> },
  { number: '24/7', label: 'AI Support', icon: <Clock className="w-6 h-6" /> },
]

const testimonials = [
  {
    content: "inspir completely transformed how I study. The AI tutor is like having a personal teacher available 24/7!",
    name: "Sarah Chen",
    role: "A-Level Student",
    rating: 5
  },
  {
    content: "I went from struggling with maths to getting top marks. The step-by-step solutions are incredible.",
    name: "James Wilson",
    role: "GCSE Student",
    rating: 5
  },
  {
    content: "The quiz generator saved me hours of revision time. I can create practice tests in seconds!",
    name: "Emma Thompson",
    role: "University Student",
    rating: 5
  },
]

const sponsorshipOptions = [
  {
    icon: <Users className="w-10 h-10" />,
    title: 'Parents',
    description: 'Create profiles for each child',
    example: '2 kids = £13.98/month',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Building2 className="w-10 h-10" />,
    title: 'Schools',
    description: 'Sponsor entire classrooms',
    example: 'Volume pricing available',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Globe className="w-10 h-10" />,
    title: 'Organizations',
    description: 'Support educational initiatives',
    example: 'Custom packages',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: <Heart className="w-10 h-10" />,
    title: 'Companies',
    description: 'CSR & community impact',
    example: 'Sponsor students in need',
    color: 'from-amber-500 to-orange-500',
  },
]

export default function Home() {
  return (
    <>
      <StructuredData data={generateOrganizationSchema()} />
      <StructuredData data={generateWebsiteSchema()} />

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Powered by Claude AI - The World's Most Advanced AI
              </div>

              <h1 className="text-5xl sm:text-7xl font-black mb-6 text-gray-900 dark:text-white">
                Transform Learning with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  AI-Powered Education
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                One simple price: £6.99 per profile. 15 intelligent study tools. Unlimited learning. Parents, schools, and organizations can sponsor student profiles.
              </p>

              {/* Three Auth CTAs */}
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                {/* Parent Signup */}
                <Link
                  href="/signup"
                  className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-purple-600 dark:border-purple-400"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Parent Signup
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Create profiles for your children
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Parent Sign In */}
                <Link
                  href="/login"
                  className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-blue-600 dark:border-blue-400"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                    <LogIn className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Parent Sign In
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Manage your student profiles
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Student Login */}
                <Link
                  href="/chat"
                  className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-green-600 dark:border-green-400"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Student Login
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Start learning instantly
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Start Learning <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✓ No credit card required ✓ Cancel anytime ✓ All 15 tools included
              </p>
            </div>
          </div>

          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-300 dark:bg-green-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                    {stat.icon}
                    <div className="text-4xl font-black text-gray-900 dark:text-white">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsorship Pricing Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                Sponsor a Student's Future
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
                £6.99 per profile. Unlimited learning. Parents, schools, organizations, and companies can sponsor student profiles to transform education.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-purple-600 dark:border-purple-400">
                <span className="text-5xl font-black text-gray-900 dark:text-white">£6.99</span>
                <span className="text-lg text-gray-600 dark:text-gray-300">/profile/month</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {sponsorshipOptions.map((option, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white mx-auto mb-4`}>
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {option.description}
                  </p>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {option.example}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-lg"
              >
                View Full Pricing Details
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                Why Students Love inspir
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to excel academically, powered by cutting-edge AI technology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All 15 Tools Grid */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                  15 Powerful Study Tools
                </h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Every tool you need to study effectively, all in one beautifully designed platform. No switching between apps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {allTools.map((tool, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-400 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-lg"
              >
                Explore All Tools in Detail
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                Loved by Thousands of Students
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See what students are saying about inspir
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                Get Started in 3 Easy Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: '1',
                  title: 'Sign Up',
                  desc: 'Parents create an account and add student profiles. £6.99 per profile.',
                  icon: <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                },
                {
                  step: '2',
                  title: 'Students Login',
                  desc: 'Each student gets their own login with access to all 15 tools.',
                  icon: <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                },
                {
                  step: '3',
                  title: 'Start Learning',
                  desc: 'Get unlimited AI-powered help and watch grades improve.',
                  icon: <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 mb-6">
                    {item.icon}
                  </div>
                  <div className="text-5xl font-black text-purple-600 dark:text-purple-400 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to Transform Education?
            </h2>
            <p className="text-xl text-purple-100 mb-4 leading-relaxed">
              £6.99 per profile. Everything unlimited. Sponsor a student's future today.
            </p>
            <p className="text-2xl font-bold text-white mb-10">
              Parents, Schools, Organizations - Start Now
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-purple-600 font-bold rounded-lg text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                Parent Signup
                <UserPlus className="w-6 h-6" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-10 py-5 bg-purple-900 text-white font-bold rounded-lg text-xl hover:scale-105 transition-transform shadow-2xl border-2 border-white"
              >
                Student Login
                <GraduationCap className="w-6 h-6" />
              </Link>
            </div>
            <p className="text-sm text-purple-100 mt-6">
              No credit card required • All 15 tools included • Cancel anytime • Unlimited learning
            </p>
          </div>
        </section>

      </main>
    </>
  )
}
