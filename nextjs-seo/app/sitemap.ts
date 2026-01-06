import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient()
  const baseUrl = 'https://inspir.uk'

  // Get all published blog posts
  const { data: posts } = await supabase
    .from('seo_blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Get all tool pages
  const { data: tools } = await supabase
    .from('seo_tool_pages')
    .select('slug, updated_at')
    .order('title')

  // Get all categories
  const { data: categories } = await supabase
    .from('seo_blog_categories')
    .select('slug')
    .order('name')

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mission`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const toolPages: MetadataRoute.Sitemap =
    tools?.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

  const blogPosts: MetadataRoute.Sitemap =
    posts?.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at
        ? new Date(post.updated_at)
        : post.published_at
        ? new Date(post.published_at)
        : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || []

  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

  return [...staticPages, ...toolPages, ...blogPosts, ...categoryPages]
}
