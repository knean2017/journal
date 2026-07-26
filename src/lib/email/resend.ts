import 'server-only'

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM ?? 'ICRR Journal <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
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
