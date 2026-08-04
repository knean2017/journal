'use server'

import { revalidatePath } from 'next/cache'
import {
  bodyFor,
  checkQuota,
  chunk,
  parseScheduledAt,
  subjectFor,
  type Recipient,
  type Sendable,
} from './send'
import { requireCapability } from '@/lib/admin/session'
import { sendBatch, type BatchMessage } from '@/lib/email/resend'
import { text, type FormResult } from '@/lib/form-result'
import { SITE_URL } from '@/lib/site'
import { adminPath, isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

/** Midnight today and the first of this month, for the allowance counters. */
function windows(now = new Date()) {
  const day = new Date(now)
  day.setHours(0, 0, 0, 0)

  const month = new Date(now.getFullYear(), now.getMonth(), 1)
  return { since: day.toISOString(), monthStart: month.toISOString() }
}

/**
 * Mails one published announcement to every confirmed subscriber.
 *
 * The irreversible action in this panel, so it refuses far more than it
 * accepts: an unpublished announcement, one already sent, an unconfirmed list,
 * or a send the free allowance does not cover, all stop before a message
 * leaves. Everything it does check is checked here rather than in the page,
 * because a server action is reachable by direct POST whatever the page shows.
 */
export async function sendAnnouncement(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  const admin = await requireCapability('announcement_sends', 'edit')

  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'No database is attached, so there is no list to send to.' }
  }

  const announcementId = text(form, 'announcementId')
  if (!announcementId) return { ok: false, message: 'Choose an announcement to send.' }

  /*
   * A time, or nothing. The provider takes the scheduling on itself, so a
   * scheduled send needs no cron, no queue, and no second deploy target: the
   * batch is handed over now and released later.
   */
  const when = text(form, 'scheduledAt')
  let scheduledAt: string | undefined

  if (when.trim()) {
    const parsedWhen = parseScheduledAt(when)
    if (typeof parsedWhen !== 'string') return { ok: false, message: parsedWhen.error }
    scheduledAt = parsedWhen
  }

  const supabase = createSupabaseServiceClient()

  const { data: announcement, error: readError } = await supabase
    .from('announcements')
    .select('id, title, tag, blurb, body, slug, cta_label, cta_href, is_published')
    .eq('id', announcementId)
    .maybeSingle()

  if (readError || !announcement) {
    return { ok: false, message: 'That announcement could not be found.' }
  }

  // An unpublished announcement is a draft. Mailing it would put text on
  // thousands of screens that the site itself will not show.
  if (!announcement.is_published) {
    return { ok: false, message: 'Publish the announcement before mailing it.' }
  }

  /*
   * Already sent, or already scheduled and not yet released. Both block:
   * pressing the button twice is the likeliest mistake here, and the second
   * press is indistinguishable from the first.
   */
  const { data: priorSends } = await supabase
    .from('announcement_sends')
    .select('id, status, sent_at, scheduled_at')
    .eq('announcement_id', announcement.id)
    .neq('status', 'failed')

  if (priorSends && priorSends.length > 0) {
    const prior = priorSends[0]
    return {
      ok: false,
      message: prior.sent_at
        ? 'That announcement has already been mailed to the list.'
        : 'That announcement is already scheduled to go out.',
    }
  }

  /*
   * The recipients. Both conditions matter and neither is redundant: active
   * means they have not left, confirmed means the address proved itself. This
   * query is the only place the rule is enforced, so it is deliberately not
   * abstracted behind a helper that somewhere else could forget to call.
   */
  const { data: subscribers, error: listError } = await supabase
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('is_active', true)
    .not('confirmed_at', 'is', null)

  if (listError) {
    console.error('[send] could not read the list:', listError)
    return { ok: false, message: 'Could not read the announcement list. Nothing was sent.' }
  }

  const recipients: Recipient[] = (subscribers ?? []).map((row) => ({
    email: row.email,
    unsubscribeToken: row.unsubscribe_token,
  }))

  const { since, monthStart } = windows()

  const [today, month] = await Promise.all([
    supabase
      .from('announcement_sends')
      .select('recipient_count')
      .neq('status', 'failed')
      .gte('created_at', since),
    supabase
      .from('announcement_sends')
      .select('recipient_count')
      .neq('status', 'failed')
      .gte('created_at', monthStart),
  ])

  const total = (rows: { recipient_count: number }[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + row.recipient_count, 0)

  const quota = checkQuota({
    recipients: recipients.length,
    sentToday: total(today.data),
    sentThisMonth: total(month.data),
  })

  if (!quota.ok) return { ok: false, message: quota.reason }

  const sendable: Sendable = {
    title: announcement.title,
    tag: announcement.tag,
    blurb: announcement.blurb,
    body: announcement.body,
    slug: announcement.slug,
    ctaLabel: announcement.cta_label,
    ctaHref: announcement.cta_href,
  }

  const subject = subjectFor(sendable)

  /*
   * The record is written before the send, not after, and marked pending.
   *
   * If the process dies mid-batch, a row that was never written would leave no
   * trace that thousands of messages went out, and the next press of the
   * button would send them all again. A pending row that turns out to be a lie
   * is a much smaller problem: it blocks a resend until somebody looks.
   */
  const { data: record, error: recordError } = await supabase
    .from('announcement_sends')
    .insert({
      announcement_id: announcement.id,
      subject,
      scheduled_at: scheduledAt ?? null,
      recipient_count: recipients.length,
      status: 'pending',
      sent_by: admin.userId,
    })
    .select('id')
    .single()

  if (recordError || !record) {
    console.error('[send] could not record the send:', recordError)
    return { ok: false, message: 'Could not record the send, so nothing was sent.' }
  }

  const messages: BatchMessage[] = recipients.map((recipient) => ({
    to: recipient.email,
    subject,
    text: bodyFor(sendable, recipient, SITE_URL),
  }))

  const ids: string[] = []

  for (const batch of chunk(messages)) {
    const outcome = await sendBatch(batch, scheduledAt)
    ids.push(...outcome.ids)

    if (!outcome.ok) {
      await supabase
        .from('announcement_sends')
        .update({
          status: 'failed',
          error: outcome.reason,
          recipient_count: ids.length,
          provider_ids: ids,
        })
        .eq('id', record.id)

      return {
        ok: false,
        message:
          ids.length > 0
            ? `Sending stopped after ${ids.length} of ${recipients.length}. ${outcome.reason}`
            : `Nothing was sent. ${outcome.reason}`,
      }
    }
  }

  await supabase
    .from('announcement_sends')
    .update({
      status: scheduledAt ? 'scheduled' : 'sent',
      sent_at: scheduledAt ? null : new Date().toISOString(),
      provider_ids: ids,
    })
    .eq('id', record.id)

  revalidatePath(`/${adminPath()}/send`)

  return {
    ok: true,
    message: scheduledAt
      ? `Scheduled for ${new Date(scheduledAt).toLocaleString('en-GB')}, to ${recipients.length} ${recipients.length === 1 ? 'address' : 'addresses'}.`
      : `Sent to ${recipients.length} ${recipients.length === 1 ? 'address' : 'addresses'}.`,
  }
}
