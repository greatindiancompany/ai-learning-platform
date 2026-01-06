import { Metadata } from 'next'

interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
  noindex?: boolean
}

const baseUrl = 'https://inspir.uk'

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/images/mission-1.jpg',
  canonical,
  noindex = false,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    keywords,

    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      siteName: 'inspir',
      locale: 'en_GB',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@inspiruk',
    },

    alternates: {
      canonical: canonical || baseUrl,
    },

    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }
}

// Blog post specific metadata
export function generateBlogPostMetadata(post: any): Metadata {
  return {
    ...generatePageMetadata({
      title: post.seo_title,
      description: post.seo_description,
      keywords: post.seo_keywords || [],
      ogImage: post.og_image_url,
      canonical: `${baseUrl}/blog/${post.slug}`,
    }),

    authors: post.author?.name ? [{ name: post.author.name }] : undefined,

    openGraph: {
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.author?.name ? [post.author.name] : undefined,
      section: post.category?.name,
      tags: post.tags?.map((t: any) => t.name) || [],
    },
  }
}

// Tool page specific metadata
export function generateToolPageMetadata(tool: any): Metadata {
  return generatePageMetadata({
    title: tool.seo_title,
    description: tool.seo_description,
    keywords: tool.seo_keywords || [],
    ogImage: tool.og_image_url || `/assets/og-images/${tool.slug}-og.png`,
    canonical: `${baseUrl}/tools/${tool.slug}`,
  })
}
