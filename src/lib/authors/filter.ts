import type { Article, Author } from '@/lib/content'

export type AuthorCard = Author & {
  publicationCount: number
  publicationTitles: string[]
}

export function buildAuthorCards(authors: Author[], articles: Article[]): AuthorCard[] {
  return authors.map((author) => {
    const own = articles.filter((a) => a.authors.some((x) => x.authorId === author.id))
    return {
      ...author,
      publicationCount: own.length,
      publicationTitles: own.map((a) => a.title),
    }
  })
}

/**
 * Case-insensitive substring match across name, affiliation, discipline, role,
 * bio, research interests, and publication titles.
 */
export function filterAuthors(
  cards: AuthorCard[],
  disciplineName: string,
  query: string,
): AuthorCard[] {
  const needle = query.trim().toLowerCase()
  return cards.filter((card) => {
    if (disciplineName !== 'All' && card.disciplineName !== disciplineName) return false
    if (!needle) return true
    const haystack = [
      card.name,
      card.affiliation,
      card.disciplineName,
      card.role,
      card.bio,
      card.interests.join(' '),
      card.publicationTitles.join(' '),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

export function publicationLabel(count: number): string {
  if (count === 0) return 'Under review for Issue 1'
  return `${count} ${count === 1 ? 'article' : 'articles'}`
}

export function countLabel(visible: number, total: number): string {
  return visible === total ? `${total} contributors` : `${visible} of ${total} contributors`
}
