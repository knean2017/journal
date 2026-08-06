/**
 * The announcement signup, which used to refuse everybody.
 *
 * It is double opt-in, and the confirmation link it depends on cannot be
 * delivered until a sending domain is verified at the mail provider. That used
 * to fail the whole form: the address was discarded and the reader was told to
 * try again in a few minutes, which would never work. These tests pin the two
 * halves of the repair. The rule that nothing is mailed to an unconfirmed
 * address is unchanged, and a provider that will not send the link no longer
 * costs the address itself.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SUBSCRIBE_ALREADY_TOAST,
  SUBSCRIBE_CONFIRM_TOAST,
  SUBSCRIBE_PENDING_TOAST,
  SUBSCRIBE_UNAVAILABLE_TOAST,
} from '@/lib/toasts'

const state = {
  configured: true,
  emailConfigured: true,
  /** What the lookup before the write finds, or null for an unknown address. */
  existing: null as { confirmed_at: string | null; is_active: boolean } | null,
  upsertError: null as { message: string } | null,
  /** Every row handed to upsert, so the test can read what was written. */
  written: [] as Record<string, unknown>[],
  notified: [] as { to: string; subject: string; text: string }[],
  notifyResult: true,
}

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
}))

vi.mock('@/lib/rate-limit', () => ({
  clientKey: () => 'test',
  rateLimit: () => true,
}))

vi.mock('@/lib/supabase/env', () => ({
  isSupabaseConfigured: () => state.configured,
  adminPath: () => 'admin',
}))

vi.mock('@/lib/email/resend', () => ({
  isEmailConfigured: () => state.emailConfigured,
  notify: async (to: string, subject: string, text: string) => {
    state.notified.push({ to, subject, text })
    return state.notifyResult
  },
}))

vi.mock('@/lib/supabase/service', () => ({
  createSupabaseServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: state.existing, error: null }) }),
      }),
      upsert: (row: Record<string, unknown>) => {
        state.written.push(row)
        return {
          select: () => ({
            maybeSingle: async () => ({
              data: state.upsertError
                ? null
                : { confirm_token: '11111111-2222-3333-4444-555555555555' },
              error: state.upsertError,
            }),
          }),
        }
      },
    }),
  }),
}))

const { subscribe } = await import('@/lib/submissions/actions')

const form = (email: string) => {
  const data = new FormData()
  data.set('email', email)
  return data
}

beforeEach(() => {
  state.configured = true
  state.emailConfigured = true
  state.existing = null
  state.upsertError = null
  state.written = []
  state.notified = []
  state.notifyResult = true
})

describe('subscribe', () => {
  it('stores a new address unconfirmed and sends the link', async () => {
    const result = await subscribe(null, form('reader@university.edu'))

    expect(result).toEqual({ ok: true, message: SUBSCRIBE_CONFIRM_TOAST })
    expect(state.written).toHaveLength(1)
    expect(state.written[0]).toMatchObject({
      email: 'reader@university.edu',
      is_active: true,
      unsubscribed_at: null,
      // The whole rule: not mailable until the confirm route writes this.
      confirmed_at: null,
    })
    expect(state.notified[0].to).toBe('reader@university.edu')
    expect(state.notified[0].text).toContain(
      '/subscribe/confirm?token=11111111-2222-3333-4444-555555555555',
    )
  })

  it('keeps the address when the provider refuses the link', async () => {
    state.notifyResult = false

    const result = await subscribe(null, form('reader@university.edu'))

    // The bug this replaced: ok was false and the row was pointless.
    expect(result.ok).toBe(true)
    expect(result.message).toBe(SUBSCRIBE_PENDING_TOAST)
    expect(state.written).toHaveLength(1)
  })

  it('keeps the address when there is no mail provider at all', async () => {
    state.emailConfigured = false

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result).toEqual({ ok: true, message: SUBSCRIBE_PENDING_TOAST })
    expect(state.written).toHaveLength(1)
    expect(state.notified).toHaveLength(0)
  })

  it('never claims a link was sent when it was not', async () => {
    state.notifyResult = false

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result.message).not.toBe(SUBSCRIBE_CONFIRM_TOAST)
  })

  it('tells somebody already confirmed, and writes nothing', async () => {
    state.existing = { confirmed_at: '2026-01-01T00:00:00.000Z', is_active: true }

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result).toEqual({ ok: true, message: SUBSCRIBE_ALREADY_TOAST })
    expect(state.written).toHaveLength(0)
    expect(state.notified).toHaveLength(0)
  })

  it('makes somebody who had unsubscribed confirm again', async () => {
    state.existing = { confirmed_at: '2026-01-01T00:00:00.000Z', is_active: false }

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result.message).toBe(SUBSCRIBE_CONFIRM_TOAST)
    // Their old confirmation proved the address then. This request came from a
    // browser, so it proves nothing, and the old timestamp must not carry over.
    expect(state.written[0]).toMatchObject({
      is_active: true,
      unsubscribed_at: null,
      confirmed_at: null,
    })
  })

  it('sends the link again to somebody who never opened the first', async () => {
    state.existing = { confirmed_at: null, is_active: true }

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result.message).toBe(SUBSCRIBE_CONFIRM_TOAST)
    expect(state.notified).toHaveLength(1)
  })

  it('refuses an address that is not one', async () => {
    const result = await subscribe(null, form('not-an-address'))

    expect(result.ok).toBe(false)
    expect(state.written).toHaveLength(0)
    expect(state.notified).toHaveLength(0)
  })

  it('says so plainly when there is no database', async () => {
    state.configured = false

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result).toEqual({ ok: false, message: SUBSCRIBE_UNAVAILABLE_TOAST })
  })

  it('reports a failed write rather than claiming success', async () => {
    state.upsertError = { message: 'connection refused' }

    const result = await subscribe(null, form('reader@university.edu'))

    expect(result.ok).toBe(false)
    expect(state.notified).toHaveLength(0)
  })
})
