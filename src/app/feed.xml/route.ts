import { getArticles } from '@/lib/content'
import { SITE_DESCRIPTION, SITE_NAME, absolute } from '@/lib/site'

/**
 * The journal's feed, on the same refresh as the pages it describes.
 *
 * Free indexes and aggregators, and readers who follow a journal rather than
 * visit it, expect a feed at a stable address, and the address has to work
 * before there is anything in it, because that is when they are told about it.
 * An empty channel is valid Atom and says exactly the right thing: a real
 * journal with nothing published yet.
 */
export const revalidate = 300

/** XML text nodes, with the five characters that cannot appear raw. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Atom timestamps are RFC 3339, so a bare `2026-01-15` is not one. Publication
 * dates are stored as days because that is what a journal issue has, and
 * midnight UTC is the reading of a day that every parser agrees on.
 */
function timestamp(day: string): string {
  return `${day}T00:00:00Z`
}

export async function GET(): Promise<Response> {
  const articles = (await getArticles()).filter((article) => article.status === 'published')

  const updated = articles.reduce(
    (latest, article) =>
      article.publishedOn && article.publishedOn > latest ? article.publishedOn : latest,
    '',
  )

  const today = new Date().toISOString().slice(0, 10)

  const entries = articles
    .map((article) => {
      const url = absolute(`/articles/${article.slug}`)
      const authors = article.authors
        .map((author) => `    <author><name>${escape(author.authorName)}</name></author>`)
        .join('\n')

      return [
        '  <entry>',
        `    <id>${escape(url)}</id>`,
        `    <title>${escape(article.title)}</title>`,
        `    <link href="${escape(url)}"/>`,
        // `updated` is required on every entry, `published` only when known.
        `    <updated>${timestamp(article.publishedOn ?? today)}</updated>`,
        article.publishedOn ? `    <published>${timestamp(article.publishedOn)}</published>` : '',
        authors,
        `    <summary>${escape(article.abstract)}</summary>`,
        '  </entry>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const body = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${escape(absolute('/'))}</id>`,
    `  <title>${escape(SITE_NAME)}</title>`,
    `  <subtitle>${escape(SITE_DESCRIPTION)}</subtitle>`,
    `  <link href="${escape(absolute('/feed.xml'))}" rel="self"/>`,
    `  <link href="${escape(absolute('/'))}"/>`,
    // A feed with no entries still needs a timestamp for the channel itself.
    `  <updated>${timestamp(updated || today)}</updated>`,
    entries,
    '</feed>',
  ]
    .filter(Boolean)
    .join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
