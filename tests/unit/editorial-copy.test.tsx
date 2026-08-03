import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { JournalAtAGlance } from '@/components/site/about/JournalAtAGlance'
import { ProcessSteps } from '@/components/site/home/ProcessSteps'
import { ENTITIES, WRITABLE_TABLES, findEntity } from '@/lib/admin/entities'
import { areaForEntity } from '@/lib/admin/permissions'

/*
 * The five blocks that moved out of src/lib/content/seed/process.ts and into
 * the panel. Their tables ship empty, so the two states that matter are a read
 * that fails (seed content, not a broken page) and a list that is genuinely
 * empty (nothing at all, not a heading over nothing).
 */

const reads = vi.hoisted(() => ({
  getTimeline: vi.fn(),
  getProcessSteps: vi.fn(),
  getFacts: vi.fn(),
  getRequirements: vi.fn(),
  getChecklist: vi.fn(),
}))

vi.mock('@/lib/supabase/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase/env')>()
  return { ...actual, isSupabaseConfigured: () => true }
})

vi.mock('@/lib/content/sources/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content/sources/supabase')>()
  return { ...actual, ...reads }
})

const EDITORIAL_COPY = [
  { slug: 'timeline', table: 'timeline_entries' },
  { slug: 'process-steps', table: 'process_steps' },
  { slug: 'facts', table: 'journal_facts' },
  { slug: 'requirements', table: 'submission_requirements' },
  { slug: 'checklist', table: 'submission_checklist' },
]

describe('editorial copy entities', () => {
  it.each(EDITORIAL_COPY)('$slug is an entity on $table', ({ slug, table }) => {
    const entity = findEntity(slug)
    expect(entity, slug).toBeDefined()
    expect(entity?.table).toBe(table)
    expect(entity?.canCreate).toBe(true)
    expect(entity?.canDelete).toBe(true)
    expect(entity?.orderBy).toEqual({ column: 'sort_order', ascending: true })
  })

  it.each(EDITORIAL_COPY)('$slug is writable and gated on the journal record', ({ slug, table }) => {
    expect(WRITABLE_TABLES.has(table)).toBe(true)
    expect(areaForEntity(slug)).toBe('content.journal')
  })

  it('gives every one of them a way to be ordered', () => {
    for (const { slug } of EDITORIAL_COPY) {
      const fields = findEntity(slug)?.fields ?? []
      expect(fields.some((field) => field.name === 'sort_order'), slug).toBe(true)
    }
  })

  it('keeps the slugs unique across the whole panel', () => {
    expect(new Set(ENTITIES.map((e) => e.slug)).size).toBe(ENTITIES.length)
  })

  /*
   * The columns are named for the database, not for the seed shape they
   * replaced: `when` is reserved in Postgres and `filled` described a dot
   * rather than the thing being recorded.
   */
  it('names the timeline fields after the columns, not the old seed keys', () => {
    const names = findEntity('timeline')?.fields.map((f) => f.name)
    expect(names).toContain('when_label')
    expect(names).toContain('is_reached')
    expect(names).not.toContain('when')
    expect(names).not.toContain('filled')
  })
})

describe('editorial copy getters', () => {
  it('serves what the database returns', async () => {
    const rows = [{ title: 'Publication', when: '15 Sept 2026', body: 'Open access.', filled: false }]
    reads.getTimeline.mockResolvedValueOnce(rows)

    const { getTimeline } = await import('@/lib/content')
    expect(await getTimeline()).toEqual(rows)
  })

  it('serves an empty list as an empty list, never as seed content', async () => {
    reads.getFacts.mockResolvedValueOnce([])

    const { getFacts } = await import('@/lib/content')
    expect(await getFacts()).toEqual([])
  })

  it('falls back to the seed copy when the read fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    reads.getRequirements.mockRejectedValueOnce(new Error('connection refused'))

    const [{ getRequirements }, { requirements }] = await Promise.all([
      import('@/lib/content'),
      import('@/lib/content/seed/process'),
    ])

    expect(await getRequirements()).toEqual(requirements)
  })

  it('falls back for the checklist too, which is a bare list of strings', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    reads.getChecklist.mockRejectedValueOnce(new Error('connection refused'))

    const [{ getChecklist }, { checklist }] = await Promise.all([
      import('@/lib/content'),
      import('@/lib/content/seed/process'),
    ])

    expect(await getChecklist()).toEqual(checklist)
  })
})

describe('blocks with nothing in them', () => {
  const steps = [{ number: '1', time: 'Day 1', title: 'Submission', body: 'Upload it.' }]
  const facts = [{ key: 'Founded', value: '2026' }]

  it('renders the process steps when there are some', () => {
    render(<ProcessSteps steps={steps} />)
    expect(screen.getByText('From submission to publication')).toBeInTheDocument()
  })

  it('drops the process steps heading with them', () => {
    const { container } = render(<ProcessSteps steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders journal at a glance when there are facts', () => {
    render(<JournalAtAGlance facts={facts} />)
    expect(screen.getByText('Journal at a glance')).toBeInTheDocument()
  })

  it('drops the whole panel, header bar included, when there are none', () => {
    const { container } = render(<JournalAtAGlance facts={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
