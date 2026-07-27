import { describe, expect, it } from 'vitest'
import {
  getAnnouncements,
  getAuthorBySlug,
  getAuthors,
  getConfig,
  getCurrentIssue,
  getDisciplines,
  getEditorialRoles,
  getTeam,
  getTickerLines,
} from '@/lib/content'

describe('content accessors', () => {
  it('returns the six seeded authors with unique slugs', async () => {
    const authors = await getAuthors()
    expect(authors).toHaveLength(6)
    expect(new Set(authors.map((a) => a.slug)).size).toBe(6)
  })

  it('finds an author by slug', async () => {
    const author = await getAuthorBySlug('amara-okonkwo')
    expect(author?.name).toBe('Amara Okonkwo')
    expect(author?.disciplineSlug).toBe('natural-sciences')
  })

  it('returns null for an unknown slug rather than throwing', async () => {
    expect(await getAuthorBySlug('nobody')).toBeNull()
  })

  it('returns the five disciplines in order', async () => {
    const names = (await getDisciplines()).map((d) => d.name)
    expect(names).toEqual([
      'Natural Sciences',
      'Business & Economics',
      'Law & Policy',
      'Humanities',
      'Social Sciences',
    ])
  })

  it('returns the three team members', async () => {
    const team = await getTeam()
    expect(team.map((t) => t.name)).toEqual(['Ayla Ahmadova', 'Kanan Hajiyev', 'Gunel Ahmadova'])
  })

  it('returns seven editorial roles and excludes Editor-in-Chief', async () => {
    const roles = await getEditorialRoles()
    expect(roles).toHaveLength(7)
    expect(roles.some((r) => r.title.includes('Editor-in-Chief'))).toBe(false)
  })

  it('returns config with the deadline and expected dates', async () => {
    const config = await getConfig()
    expect(config.deadline).toBe('31 August 2026')
    expect(config.expected).toBe('30 September 2026')
    expect(config.showPreviewNotes).toBe(true)
  })

  it('returns the three ticker lines', async () => {
    expect(await getTickerLines()).toHaveLength(3)
  })

  it('returns the three announcements newest first', async () => {
    const news = await getAnnouncements()
    expect(news).toHaveLength(3)
    expect(news[0].title).toBe('Call for Papers: Volume 1, Issue 1')
  })

  it('returns Volume 1 Issue 1 as the current issue, in preparation', async () => {
    const issue = await getCurrentIssue()
    expect(issue?.volume).toBe(1)
    expect(issue?.number).toBe(1)
    expect(issue?.status).toBe('in_preparation')
  })
})

describe('copy rules', () => {
  it('contains no em dashes in any seeded copy', async () => {
    const everything = JSON.stringify([
      await getConfig(),
      await getDisciplines(),
      await getTeam(),
      await getEditorialRoles(),
      await getAuthors(),
      await getAnnouncements(),
      await getTickerLines(),
    ])
    expect(everything).not.toContain('—')
  })
})
