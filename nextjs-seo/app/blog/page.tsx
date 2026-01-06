import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { generatePageMetadata } from '@/lib/metadata'
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react'
import BlogCard from '@/components/BlogCard'

export const metadata = generatePageMetadata({
  title: 'Study Tips & AI Education Blog',
  description: 'Expert study tips, exam preparation guides, and AI education insights. Learn how to study smarter with proven techniques and AI-powered tools.',
  keywords: ['study tips', 'exam preparation', 'learning strategies', 'AI education', 'student blog'],
  canonical: 'https://inspir.uk/blog',
})

export default async function BlogPage() {
  const supabase = createServerClient()

  // Get all published blog posts
  const { data: posts } = await supabase
    .from('seo_blog_posts')
    .select(`
      *,
      author:seo_authors(name, avatar_url),
      category:seo_blog_categories(name, slug, color)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Get featured posts (top 3)
  const featuredPosts = posts?.slice(0, 3) || []
  const regularPosts = posts?.slice(3) || []

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Study Smarter, Not Harder
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 text-gray-900 dark:text-white">
              inspir Learning Hub
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Expert study tips, exam preparation guides, and insights on AI-powered learning. Everything you need to excel academically.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                Featured Articles
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post.slug}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  image={post.featured_image}
                  author={post.author?.name || 'inspir Team'}
                  category={post.category?.name || 'Article'}
                  publishedAt={post.published_at}
                  readTime={post.avg_read_time_minutes || 5}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              Latest Articles
            </h2>
          </div>

          {regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <BlogCard
                  key={post.slug}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  image={post.featured_image}
                  author={post.author?.name || 'inspir Team'}
                  category={post.category?.name || 'Article'}
                  publishedAt={post.published_at}
                  readTime={post.avg_read_time_minutes || 5}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Stay Updated with Study Tips
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Get the latest study strategies, exam tips, and AI learning insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-600 dark:focus:border-purple-400 focus:outline-none"
            />
            <button className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Free weekly newsletter • Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Apply these insights with our AI-powered study tools. Start your 14-day free trial today.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-lg"
          >
            Start Free Trial
            <Sparkles className="w-5 h-5" />
          </Link>
          <p className="text-sm text-purple-100 mt-4">
            14-day free trial • All 15 tools • No credit card required
          </p>
        </div>
      </section>
    </main>
  )
}
