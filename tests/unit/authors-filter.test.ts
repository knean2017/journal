import { describe, expect, it } from 'vitest'
import { getArticles, getAuthors } from '@/lib/content'
import { buildAuthorCards, countLabel, filterAuthors, publicationLabel } from '@/lib/authors/filter'

const cards = async () => buildAuthorCards(await getAuthors(), await getArticles())

describe('buildAuthorCards', () => {
  it('attaches publication counts from articles', async () => {
    const all = await cards()
    expect(all.find((a) => a.slug === 'amara-okonkwo')?.publicationCount).toBe(1)
    expect(all.find((a) => a.slug === 'sofia-almeida')?.publicationCount).toBe(0)
  })
})

describe('filterAuthors', () => {
  it('returns everyone for All sections and an empty query', async () => {
    expect(filterAuthors(await cards(), 'All', '')).toHaveLength(6)
  })

  it('filters by discipline name', async () => {
    const result = filterAuthors(await cards(), 'Natural Sciences', '')
    expect(result.map((a) => a.slug).sort()).toEqual(['amara-okonkwo', 'lukas-brenner'])
  })

  it('matches name case-insensitively', async () => {
    expect(filterAuthors(await cards(), 'All', 'PRIYA')).toHaveLength(1)
  })

  it('matches affiliation', async () => {
    expect(filterAuthors(await cards(), 'All', 'edinburgh')[0].slug).toBe('amara-okonkwo')
  })

  it('matches research interests', async () => {
    expect(filterAuthors(await cards(), 'All', 'proportionality')[0].slug).toBe('sofia-almeida')
  })

  it('matches bio text', async () => {
    expect(filterAuthors(await cards(), 'All', 'colorimetric')[0].slug).toBe('lukas-brenner')
  })

  it('matches publication titles', async () => {
    expect(filterAuthors(await cards(), 'All', 'treaty ports')[0].slug).toBe('kenji-watanabe')
  })

  it('matches role', async () => {
    expect(filterAuthors(await cards(), 'All', 'LLM candidate')[0].slug).toBe('sofia-almeida')
  })

  it('combines discipline and query, returning empty when they conflict', async () => {
    expect(filterAuthors(await cards(), 'Humanities', 'edinburgh')).toEqual([])
  })

  it('ignores surrounding whitespace in the query', async () => {
    expect(filterAuthors(await cards(), 'All', '  priya  ')).toHaveLength(1)
  })
})

describe('publicationLabel', () => {
  it.each([
    [0, 'Under review for Issue 1'],
    [1, '1 article'],
    [2, '2 articles'],
  ])('renders %i as "%s"', (count, expected) => {
    expect(publicationLabel(count)).toBe(expected)
  })
})

describe('countLabel', () => {
  it('reads plainly when nothing is filtered out', () => {
    expect(countLabel(6, 6)).toBe('6 contributors')
  })

  it('reads as a subset when filtered', () => {
    expect(countLabel(3, 6)).toBe('3 of 6 contributors')
  })

  it('reads as a subset when empty', () => {
    expect(countLabel(0, 6)).toBe('0 of 6 contributors')
  })
})
