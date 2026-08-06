import { DeleteButton } from '@/components/admin/DeleteButton'
import {
  SendAnnouncementForm,
  type SendableAnnouncement,
} from '@/components/admin/SendAnnouncementForm'
import { deleteSend } from '@/lib/admin/actions'
import { canDo, requireCapability } from '@/lib/admin/session'
import { FREE_TIER } from '@/lib/announcements/send'
import { isEmailConfigured } from '@/lib/email/resend'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'not yet'

export default async function SendPage() {
  await requireCapability('announcement_sends', 'view')
  const canDelete = await canDo('announcement_sends', 'edit')

  const supabase = createSupabaseServiceClient()

  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)

  const [announcementRows, subscriberRows, sendRows, todayRows] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, tag, published_on')
      .eq('is_published', true)
      .order('published_on', { ascending: false }),
    supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('confirmed_at', 'is', null),
    supabase
      .from('announcement_sends')
      .select('id, announcement_id, subject, status, sent_at, scheduled_at, recipient_count, error')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('announcement_sends')
      .select('recipient_count')
      .neq('status', 'failed')
      .gte('created_at', midnight.toISOString()),
  ])

  const sends = sendRows.data ?? []
  const spentToday = (todayRows.data ?? []).reduce((sum, row) => sum + row.recipient_count, 0)
  const recipients = subscriberRows.count ?? 0

  const sentIds = new Set(
    sends.filter((row) => row.status !== 'failed').map((row) => row.announcement_id),
  )

  const announcements: SendableAnnouncement[] = (announcementRows.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    tag: row.tag,
    publishedOn: row.published_on,
    alreadySent: sentIds.has(row.id),
  }))

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Send an announcement</h1>
      <div className="rule-double mt-5" />

      <p className="mt-6 mb-0 max-w-[70ch] text-[14px] leading-[1.8] text-body">
        This mails a published announcement to everyone who asked for announcements and confirmed
        their address. It cannot be undone. <strong>{recipients}</strong>{' '}
        {recipients === 1 ? 'address is' : 'addresses are'} confirmed, and{' '}
        <strong>{Math.max(FREE_TIER.perDay - spentToday, 0)}</strong> of today&rsquo;s{' '}
        {FREE_TIER.perDay} free messages are left.
      </p>

      {!isEmailConfigured() ? (
        <p className="mt-5 mb-0 max-w-[70ch] border border-maroon bg-cream-tint px-4 py-3 text-[14px] leading-[1.7] text-maroon">
          No mail provider is configured. Set <code>RESEND_API_KEY</code> before sending, or the
          send will be refused and recorded as failed.
        </p>
      ) : null}

      {recipients === 0 ? (
        <p className="mt-5 mb-0 max-w-[70ch] text-[14px] leading-[1.8] text-body-muted">
          Nobody has confirmed an address yet, so there is nobody to send to. Addresses become
          sendable once somebody asks on the news page and opens the link we email them. If the
          announcement list shows addresses waiting, the confirmation email is not being delivered:
          check that <code>RESEND_FROM</code> points at a verified sending domain.
        </p>
      ) : announcements.length === 0 ? (
        <p className="mt-5 mb-0 max-w-[70ch] text-[14px] leading-[1.8] text-body-muted">
          No published announcement to send. Write one under Announcements and publish it first.
        </p>
      ) : (
        <SendAnnouncementForm announcements={announcements} recipientCount={recipients} />
      )}

      <h2 className="mt-11 mb-0 font-serif text-[20px] font-normal">What has gone out</h2>
      <div className="rule-double mt-4" />

      {sends.length === 0 ? (
        <p className="mt-6 text-[14px] text-body-muted">
          Nothing has been mailed to the list yet.
        </p>
      ) : (
        <div className="mt-5 border-t border-rule">
          {sends.map((row) => (
            <div key={row.id} className="border-b border-rule py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="text-[14px] text-body">{row.subject}</span>
                <span className="text-[13px] text-body-muted">
                  {row.status === 'scheduled'
                    ? `Scheduled for ${when(row.scheduled_at)}`
                    : row.status === 'failed'
                      ? 'Failed, nothing sent'
                      : // A send that stopped partway, and one that was started
                        // and never finished. Neither may be repeated blindly,
                        // so neither may read as an ordinary completed send.
                        row.status === 'partial'
                        ? 'Stopped partway'
                        : row.status === 'pending'
                          ? 'Started, never confirmed'
                          : `Sent ${when(row.sent_at)}`}{' '}
                  · {row.recipient_count}{' '}
                  {row.recipient_count === 1 ? 'recipient' : 'recipients'}
                </span>
              </div>
              {row.error ? (
                <p className="mt-1 mb-0 text-[13px] leading-[1.7] text-maroon">{row.error}</p>
              ) : null}

              {canDelete ? (
                <div className="mt-2">
                  <DeleteButton
                    what="record"
                    warning={
                      row.status === 'sent' || row.status === 'partial' || row.status === 'pending'
                        ? 'Delete this record? It does not unsend anything. What it does do is unblock the announcement, so it can be mailed to the whole list again. Check the mail provider before you press this.'
                        : 'Delete this record? A scheduled send is not cancelled by removing its record here; cancel it at the mail provider first.'
                    }
                    onDelete={deleteSend.bind(null, row.id)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
