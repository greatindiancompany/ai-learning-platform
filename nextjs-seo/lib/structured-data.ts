export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'inspir',
    url: 'https://inspir.uk',
    logo: 'https://inspir.uk/assets/brand/logo.png',
    description: 'AI-powered study platform with 15 integrated tools for students',
    sameAs: [
      'https://twitter.com/inspiruk',
      'https://facebook.com/inspir.uk',
      'https://linkedin.com/company/inspiruk',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@inspir.uk',
    },
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'inspir',
    url: 'https://inspir.uk',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://inspir.uk/blog/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateBlogPostSchema(post: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.og_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'inspir Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'inspir',
      logo: {
        '@type': 'ImageObject',
        url: 'https://inspir.uk/assets/brand/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://inspir.uk/blog/${post.slug}`,
    },
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateProductSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'inspir AI Study Platform',
    description: '15 AI-powered study tools with 14-day free trial',
    brand: {
      '@type': 'Brand',
      name: 'inspir',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: '6.99',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://inspir.uk/pricing',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '234',
    },
  }
}

export function generateSoftwareApplicationSchema(tool: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  }
}
