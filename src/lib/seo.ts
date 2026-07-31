import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_NAME, absolute } from '@/lib/site'

/**
 * A page's title, description, canonical link and social card, together.
 *
 * Next merges metadata one field at a time, and a field a page does not
 * mention it inherits from the layout above it whole. Setting only `title`
 * and `description` therefore leaves the root layout's `alternates` and
 * `openGraph` in place: the page ends up naming the homepage as its canonical
 * URL, which is a request to be dropped from the index as a duplicate, and
 * every share of it draws the homepage's card under the homepage's title.
 *
 * Those two fields have to travel together with the title, so this is the one
 * way a public page declares itself. A page that needs more than this, an
 * article or an author, builds on top of what this returns.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  return {
    title,
    description,
    // Declaring `alternates` replaces the root layout's copy rather than
    // merging into it, so the feed link has to be repeated to survive.
    alternates: {
      canonical: path,
      types: { 'application/atom+xml': [{ url: '/feed.xml', title: SITE_NAME }] },
    },
    openGraph: {
      type: 'website',
      // Written out rather than left to the title template, which applies to
      // the tab and the search result but not to this.
      title: `${title} | ICRR`,
      description,
      url: absolute(path),
      siteName: SITE_NAME,
      locale: 'en',
    },
    twitter: { card: 'summary_large_image', title: `${title} | ICRR`, description },
  }
}

/** The ISSN, or nothing, while registration is still outstanding. */
export function resolveIssn(issnStatus: string): string | null {
  if (!issnStatus || /pending/i.test(issnStatus)) return null
  return issnStatus
}

/**
 * The journal itself, described once for the whole site.
 *
 * A `Periodical` and the organisation behind it are what let a search engine
 * treat the pages as one publication rather than fifteen unrelated documents,
 * and they are the record an article's own markup points back at. Both carry
 * a stable `@id` for exactly that reason.
 */
export function journalSchema({ issn }: { issn: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Periodical',
        '@id': absolute('/#periodical'),
        name: SITE_NAME,
        alternateName: 'ICRR',
        url: absolute('/'),
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        ...(issn ? { issn } : {}),
        publisher: { '@id': absolute('/#organization') },
      },
      {
        '@type': 'Organization',
        '@id': absolute('/#organization'),
        name: SITE_NAME,
        alternateName: 'ICRR',
        url: absolute('/'),
        logo: absolute('/brand/lockup-full.png'),
      },
    ],
  }
}
