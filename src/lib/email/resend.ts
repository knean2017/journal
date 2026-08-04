import 'server-only'

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM ?? 'ICRR Journal <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** One message in a batch: its own recipient, and its own unsubscribe link. */
export type BatchMessage = { to: string; subject: string; text: string }

export type BatchOutcome =
  | { ok: true; ids: string[] }
  | { ok: false; reason: string; ids: string[] }

/**
 * Sends many separate messages in one call, optionally at a chosen time.
 *
 * Unlike `notify`, a failure here is reported rather than swallowed. The
 * caller is recording that an announcement went to the list, and a record
 * saying it was sent when it was not is worse than no record: nobody would
 * think to send it again.
 *
 * Ids of whatever did go out are returned even on failure, because a batch can
 * fail after earlier calls succeeded, and those messages are gone. The caller
 * needs them to say how far it got.
 */
export async function sendBatch(
  messages: BatchMessage[],
  scheduledAt?: string,
): Promise<BatchOutcome> {
  if (!isEmailConfigured()) {
    return { ok: false, reason: 'No mail provider is configured (RESEND_API_KEY is not set).', ids: [] }
  }
  if (messages.length === 0) return { ok: true, ids: [] }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.batch.send(
      messages.map((message) => ({
        from: FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(scheduledAt ? { scheduledAt } : {}),
      })),
    )

    if (error) {
      console.error('[email] Resend rejected the batch:', error)
      return { ok: false, reason: error.message ?? 'The mail provider refused the batch.', ids: [] }
    }

    return { ok: true, ids: (data?.data ?? []).map((entry) => entry.id) }
  } catch (cause) {
    console.error('[email] Could not send the batch:', cause)
    return { ok: false, reason: 'Could not reach the mail provider.', ids: [] }
  }
}

/**
 * Sends a notification, and never throws.
 *
 * A stored submission must not be lost to an email problem, so failures are
 * logged and swallowed. The caller has already committed the row.
 */
export async function notify(to: string, subject: string, text: string): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY is not set; skipping notification:', subject)
    return false
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({ from: FROM, to, subject, text })
    if (error) {
      console.error('[email] Resend rejected the message:', error)
      return false
    }
    return true
  } catch (cause) {
    console.error('[email] Could not send:', cause)
    return false
  }
}
