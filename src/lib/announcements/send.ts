/**
 * What goes out, to whom, and whether the allowance covers it.
 *
 * Pure and free of React, Next, the database, and the mail provider, so the
 * arithmetic that decides whether an irreversible send may happen can be
 * tested directly rather than inferred from what arrived in somebody's inbox.
 */

import { unsubscribeUrl } from '@/lib/subscribers/unsubscribe'

/**
 * The free plan's ceilings.
 *
 * Named and kept here rather than read from the provider, which does not
 * publish them through the API. They are the limits the journal has chosen to
 * live inside; a send that would cross one is refused before a single message
 * leaves, because a batch that stops halfway is worse than one that never
 * started: some readers get the announcement, others do not, and there is no
 * way to tell which without reading the provider's log.
 */
export const FREE_TIER = {
  perDay: 100,
  perMonth: 3000,
  /** The provider's cap on one batch call, which is a different limit again. */
  perBatch: 100,
} as const

/** One recipient, as the send needs them: an address and their own way out. */
export type Recipient = { email: string; unsubscribeToken: string }

/** The announcement being mailed, as much of it as an email needs. */
export type Sendable = {
  title: string
  tag: string
  blurb: string | null
  body: string | null
  slug: string
  ctaLabel: string | null
  ctaHref: string | null
}

/**
 * Splits recipients into calls the provider will accept.
 *
 * One message per recipient rather than one message to many, because each
 * carries its own unsubscribe link. That is also why this cannot be a single
 * mail with everybody in bcc: a shared link would unsubscribe whoever clicked
 * it, which is to say the wrong person.
 */
export function chunk<T>(items: readonly T[], size: number = FREE_TIER.perBatch): T[][] {
  if (size < 1) throw new Error('chunk size must be at least 1')

  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export type QuotaVerdict =
  | { ok: true; remainingToday: number }
  | { ok: false; reason: string }

/**
 * Whether the allowance covers a send of this size.
 *
 * Checked against what has already gone out rather than against what is left,
 * so a day with two sends in it cannot pass twice. Refuses a send of nothing
 * as well: an empty list means the button would do nothing, and reporting that
 * as success would leave an editor believing an announcement had gone out.
 */
export function checkQuota({
  recipients,
  sentToday,
  sentThisMonth,
}: {
  recipients: number
  sentToday: number
  sentThisMonth: number
}): QuotaVerdict {
  if (recipients < 1) {
    return {
      ok: false,
      reason: 'Nobody on the list has confirmed their address yet, so there is nobody to send to.',
    }
  }

  const dayLeft = FREE_TIER.perDay - sentToday
  if (recipients > dayLeft) {
    return {
      ok: false,
      reason: `That would send ${recipients} messages, and only ${Math.max(dayLeft, 0)} of today's ${FREE_TIER.perDay} are left. Try again tomorrow, or schedule it.`,
    }
  }

  const monthLeft = FREE_TIER.perMonth - sentThisMonth
  if (recipients > monthLeft) {
    return {
      ok: false,
      reason: `That would send ${recipients} messages, and only ${Math.max(monthLeft, 0)} of this month's ${FREE_TIER.perMonth} are left.`,
    }
  }

  return { ok: true, remainingToday: dayLeft - recipients }
}

/** The subject line. The tag carries the kind, so the title need not repeat it. */
export function subjectFor(announcement: Sendable): string {
  return `${announcement.tag}: ${announcement.title}`
}

/**
 * The message one reader receives.
 *
 * Plain text, matching every other mail this application sends. It also means
 * the unsubscribe link is visible as a URL rather than hidden behind anchor
 * text, which is worth more here than a styled layout: a reader who wants off
 * a list should not have to hunt for the way.
 */
export function bodyFor(
  announcement: Sendable,
  recipient: Recipient,
  siteUrl: string,
): string {
  const lines = [announcement.title, '']

  if (announcement.blurb) lines.push(announcement.blurb, '')
  if (announcement.body) lines.push(announcement.body, '')

  if (announcement.ctaLabel && announcement.ctaHref) {
    lines.push(`${announcement.ctaLabel}: ${siteUrl.replace(/\/+$/, '')}${announcement.ctaHref}`, '')
  }

  lines.push(
    `Read it on the site: ${siteUrl.replace(/\/+$/, '')}/news#${announcement.slug}`,
    '',
    '---',
    'You are getting this because you confirmed your address on icrrjournal.com.',
    `Unsubscribe: ${unsubscribeUrl(siteUrl, recipient.unsubscribeToken)}`,
  )

  return lines.join('\n')
}

/**
 * When a scheduled send should go, or why the time is refused.
 *
 * The provider takes an ISO instant, and a time in the past would be sent
 * immediately, which is the one thing somebody choosing a time did not ask
 * for. A small floor rather than "any future time" leaves room for the clock
 * skew between the browser that picked it and the server that reads it.
 */
export function parseScheduledAt(value: string, now: Date = new Date()): string | { error: string } {
  if (!value.trim()) return { error: 'Pick a time, or send it now.' }

  const when = new Date(value)
  if (Number.isNaN(when.getTime())) return { error: 'That is not a time we can read.' }

  if (when.getTime() < now.getTime() + 60_000) {
    return { error: 'Pick a time at least a minute from now, or send it now instead.' }
  }

  // The provider refuses anything beyond 30 days out.
  if (when.getTime() > now.getTime() + 30 * 24 * 60 * 60 * 1000) {
    return { error: 'Scheduled sends cannot be more than 30 days ahead.' }
  }

  return when.toISOString()
}
