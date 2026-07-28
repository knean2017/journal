import type { MetadataRoute } from 'next'
import { getArticles, getAuthors } from '@/lib/content'
import { absolute } from '@/lib/site'

/**
 * Built from the content layer, so a newly published article is in the sitemap
 * as soon as it is on the site. Regenerated on the same schedule as the pages.
 */
export const revalidate = 300

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/about', priority: 0.8 },
  { path: '/issue/current', priority: 0.9 },
  { path: '/archives', priority: 0.8 },
  { path: '/authors', priority: 0.7 },
  { path: '/team', priority: 0.6 },
  { path: '/submit', priority: 0.9 },
  { path: '/news', priority: 0.6 },
  { path: '/contact', priority: 0.5 },
  { path: '/reviewers/apply', priority: 0.4 },
  { path: '/editors/apply', priority: 0.4 },
  { path: '/ethics', priority: 0.4 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authors] = await Promise.all([getArticles(), getAuthors()])
  const now = new Date()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absolute(route.path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route.priority,
    })),
    ...articles.map((article) => ({
      url: absolute(`/articles/${article.slug}`),
      // An article is fixed once published, so its own date beats today's.
      lastModified: article.publishedOn ? new Date(article.publishedOn) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
    ...authors.map((author) => ({
      url: absolute(`/authors/${author.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
