import { beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * The Supabase client reports a failed read as an `error` on the response
 * rather than by throwing. Every reader in the source file above these five
 * destructures only `data` and lets a failure become an empty result, which is
 * harmless for tables that are never empty and wrong for these, whose whole
 * design is that an empty list means "hide this block".
 *
 * Without this the bug is silent: a missing table, or one RLS refuses, drops
 * five blocks off the site instead of falling back to the seed copy, and every
 * page still returns 200.
 */

const response = vi.hoisted(() => ({ current: { data: null, error: null } as unknown }))

vi.mock('@/lib/supabase/public', () => ({
  createSupabasePublicClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve(response.current),
      }),
    }),
  }),
}))

const READERS = [
  'getTimeline',
  'getProcessSteps',
  'getFacts',
  'getRequirements',
  'getChecklist',
] as const

describe('editorial copy readers', () => {
  beforeEach(() => {
    response.current = { data: [], error: null }
  })

  it.each(READERS)('%s raises when the read failed', async (name) => {
    response.current = { data: null, error: { message: 'relation does not exist' } }

    const source = await import('@/lib/content/sources/supabase')
    await expect(source[name]()).rejects.toBeTruthy()
  })

  it.each(READERS)('%s returns an empty list when the table is merely empty', async (name) => {
    response.current = { data: [], error: null }

    const source = await import('@/lib/content/sources/supabase')
    await expect(source[name]()).resolves.toEqual([])
  })

  it('maps the two renamed columns back to the names the site reads', async () => {
    response.current = {
      data: [{ title: 'Publication', when_label: '15 Sept 2026', body: 'Open access.', is_reached: false }],
      error: null,
    }

    const { getTimeline } = await import('@/lib/content/sources/supabase')
    expect(await getTimeline()).toEqual([
      { title: 'Publication', when: '15 Sept 2026', body: 'Open access.', filled: false },
    ])
  })

  it('flattens the checklist to bare strings', async () => {
    response.current = { data: [{ text: 'The work is original.' }], error: null }

    const { getChecklist } = await import('@/lib/content/sources/supabase')
    expect(await getChecklist()).toEqual(['The work is original.'])
  })
})
