import { describe, expect, it } from 'vitest'
import {
  FREE_TIER,
  bodyFor,
  checkQuota,
  chunk,
  parseScheduledAt,
  subjectFor,
  type Recipient,
  type Sendable,
} from '@/lib/announcements/send'

const ANNOUNCEMENT: Sendable = {
  title: 'Call for Papers: Volume 1, Issue 1',
  tag: 'Call for papers',
  blurb: 'We are reading for the first issue.',
  body: 'Submissions close in October.',
  slug: 'call-for-papers-volume-1',
  ctaLabel: 'Submit your work',
  ctaHref: '/submit',
}

const READER: Recipient = {
  email: 'reader@example.com',
  // Obviously synthetic, so a secret scanner does not read it as a live token.
  unsubscribeToken: '00000000-0000-4000-8000-000000000002',
}

describe('chunk', () => {
  it('splits at the provider’s batch ceiling', () => {
    const batches = chunk(Array.from({ length: 250 }, (_, i) => i))
    expect(batches.map((batch) => batch.length)).toEqual([100, 100, 50])
  })

  it('leaves a list that already fits in one call', () => {
    expect(chunk([1, 2, 3])).toEqual([[1, 2, 3]])
  })

  it('returns nothing for an empty list rather than one empty batch', () => {
    expect(chunk([])).toEqual([])
  })

  it('refuses a size that would loop forever', () => {
    expect(() => chunk([1, 2], 0)).toThrow()
  })
})

describe('checkQuota', () => {
  it('allows a send the day has room for', () => {
    const verdict = checkQuota({ recipients: 40, sentToday: 10, sentThisMonth: 200 })
    expect(verdict).toEqual({ ok: true, remainingToday: 50 })
  })

  it('refuses a send with nobody to send to', () => {
    // Otherwise the button reports success and an editor believes an
    // announcement went out when no message was ever addressed.
    const verdict = checkQuota({ recipients: 0, sentToday: 0, sentThisMonth: 0 })
    expect(verdict.ok).toBe(false)
  })

  it('refuses a send that would cross the day’s allowance', () => {
    const verdict = checkQuota({ recipients: 30, sentToday: 80, sentThisMonth: 100 })
    expect(verdict.ok).toBe(false)
    expect(verdict.ok === false && verdict.reason).toContain('20')
  })

  it('refuses rather than sending half a list', () => {
    // The whole point of checking before the first message: a batch that stops
    // partway leaves some readers informed and others not, with no record of
    // which is which.
    const verdict = checkQuota({ recipients: FREE_TIER.perDay + 1, sentToday: 0, sentThisMonth: 0 })
    expect(verdict.ok).toBe(false)
  })

  it('refuses a send that would cross the month’s allowance', () => {
    const verdict = checkQuota({ recipients: 50, sentToday: 0, sentThisMonth: FREE_TIER.perMonth - 10 })
    expect(verdict.ok).toBe(false)
    expect(verdict.ok === false && verdict.reason).toContain('month')
  })

  it('counts a day that has already had a send', () => {
    const first = checkQuota({ recipients: 60, sentToday: 0, sentThisMonth: 0 })
    expect(first.ok).toBe(true)

    const second = checkQuota({ recipients: 60, sentToday: 60, sentThisMonth: 60 })
    expect(second.ok).toBe(false)
  })
})

describe('the message', () => {
  it('puts the tag and the title in the subject', () => {
    expect(subjectFor(ANNOUNCEMENT)).toBe('Call for papers: Call for Papers: Volume 1, Issue 1')
  })

  it('carries an unsubscribe link belonging to that recipient alone', () => {
    const text = bodyFor(ANNOUNCEMENT, READER, 'https://icrrjournal.com')
    expect(text).toContain(`https://icrrjournal.com/unsubscribe?token=${READER.unsubscribeToken}`)
  })

  it('says why the reader is getting it', () => {
    expect(bodyFor(ANNOUNCEMENT, READER, 'https://icrrjournal.com')).toContain('you confirmed')
  })

  it('resolves the call to action against the site', () => {
    const text = bodyFor(ANNOUNCEMENT, READER, 'https://icrrjournal.com')
    expect(text).toContain('Submit your work: https://icrrjournal.com/submit')
  })

  it('leaves out the parts an announcement does not have', () => {
    const bare: Sendable = {
      ...ANNOUNCEMENT,
      blurb: null,
      body: null,
      ctaLabel: null,
      ctaHref: null,
    }
    const text = bodyFor(bare, READER, 'https://icrrjournal.com')

    expect(text).toContain(ANNOUNCEMENT.title)
    expect(text).not.toContain('null')
    expect(text).toContain('Unsubscribe:')
  })
})

describe('parseScheduledAt', () => {
  const NOW = new Date('2026-08-04T12:00:00.000Z')

  it('accepts a time comfortably ahead', () => {
    expect(parseScheduledAt('2026-08-05T09:00:00.000Z', NOW)).toBe('2026-08-05T09:00:00.000Z')
  })

  it('refuses a time in the past, which the provider would send at once', () => {
    const result = parseScheduledAt('2026-08-03T09:00:00.000Z', NOW)
    expect(typeof result === 'object' && result.error).toBeTruthy()
  })

  it('refuses a time barely ahead, leaving room for clock skew', () => {
    const result = parseScheduledAt('2026-08-04T12:00:30.000Z', NOW)
    expect(typeof result === 'object' && result.error).toBeTruthy()
  })

  it('refuses more than thirty days out', () => {
    const result = parseScheduledAt('2026-09-30T12:00:00.000Z', NOW)
    expect(typeof result === 'object' && result.error).toBeTruthy()
  })

  it('refuses something that is not a time at all', () => {
    expect(typeof parseScheduledAt('tomorrow-ish', NOW)).toBe('object')
    expect(typeof parseScheduledAt('   ', NOW)).toBe('object')
  })
})
