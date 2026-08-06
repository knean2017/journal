import { DeleteButton } from '@/components/admin/DeleteButton'
import { ListToolbar } from '@/components/admin/ListToolbar'
import { deleteSubscriber } from '@/lib/admin/actions'
import { matchesQuery, matchesStatus, param } from '@/lib/admin/filter'
import { canDo, requireCapability } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * Who asked for announcements, and who has since left.
 *
 * Nobody is added here, deliberately: consent has to come from the person who
 * owns the address, and a field on this page would be a way to put somebody on
 * a mailing list who never asked.
 *
 * Removing is different, and is allowed. The unsubscribe link is how a reader
 * leaves, and it keeps the row so the date is on record. Delete is for the
 * rows that should not exist at all: a typo, an address that bounces every
 * time, or somebody who wrote to the office asking to be erased rather than
 * merely unsubscribed.
 */

const STATUSES = [
  { value: 'active', label: 'Confirmed' },
  { value: 'pending', label: 'Awaiting confirmation' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
]

/**
 * The three states, in the order they are checked.
 *
 * Unsubscribing is answered first: somebody who left before confirming is
 * gone, and reading them as pending would put them in the group the page
 * offers to chase.
 */
function stateOf(row: { is_active: boolean; confirmed_at: string | null }) {
  if (!row.is_active) return 'unsubscribed'
  return row.confirmed_at ? 'active' : 'pending'
}

const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'an unrecorded date'

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireCapability('subscribers', 'view')
  const canDelete = await canDo('subscribers', 'edit')

  const filters = await searchParams
  const query = param(filters.q)
  const status = param(filters.status)
  const sort = param(filters.sort)

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, is_active, confirmed_at, created_at, unsubscribed_at')
    .order('created_at', { ascending: sort === 'oldest' })

  const rows = data ?? []
  const shown = rows.filter(
    (row) => matchesStatus(status, stateOf(row)) && matchesQuery(query, [row.email]),
  )

  const active = rows.filter((row) => stateOf(row) === 'active').length
  const pending = rows.filter((row) => stateOf(row) === 'pending').length

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Announcement list</h1>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : rows.length > 0 ? (
        <>
          <p className="mt-6 mb-0 text-[14px] leading-[1.8] text-body">
            <strong>{active}</strong> {active === 1 ? 'address is' : 'addresses are'} confirmed and
            will be mailed. People add themselves from the news page and leave from the link at the
            foot of every announcement. Nothing is added here
            {canDelete ? ', though an address can be erased outright' : ''}.
          </p>

          {/*
            * Worth saying out loud rather than leaving to be counted. An address
            * sits here unconfirmed when the link never reached it, which is what
            * an unverified sending domain at the mail provider does to every
            * signup at once. Nothing is mailed to these people and nothing will
            * be, so a growing number here is the symptom to act on.
            */}
          {pending > 0 ? (
            <p className="mt-3 mb-0 max-w-[70ch] border border-rule bg-cream-tint px-4 py-3 text-[14px] leading-[1.7] text-body">
              <strong>{pending}</strong> {pending === 1 ? 'address has' : 'addresses have'} not
              opened the confirmation link, so {pending === 1 ? 'it is' : 'they are'} not mailed.
              Some of that is ordinary. All of it at once usually means the confirmation email is
              not being delivered: check that <code>RESEND_FROM</code> points at a verified sending
              domain.
            </p>
          ) : null}

          <ListToolbar
            action={`/${adminPath()}/subscribers`}
            query={query}
            status={status}
            statuses={STATUSES}
            sort={sort}
            sortable
            placeholder="Email address"
            shown={shown.length}
            total={rows.length}
          />

          {shown.length > 0 ? (
            <div className="mt-6 border-t border-rule">
              {shown.map((row) => (
                <div key={row.id} className="border-b border-rule py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span className="text-[14px] text-body">{row.email}</span>
                    <span className="text-[13px] text-body-muted">
                      {stateOf(row) === 'unsubscribed'
                        ? `Unsubscribed ${date(row.unsubscribed_at)}`
                        : stateOf(row) === 'pending'
                          ? `Asked ${date(row.created_at)}, not confirmed`
                          : `Confirmed ${date(row.confirmed_at)}`}
                    </span>
                  </div>

                  {canDelete ? (
                    <div className="mt-2">
                      <DeleteButton
                        what="address"
                        warning={`Erase ${row.email} from the list for good? The record that they ever asked, and the date they left if they did, goes with it.`}
                        onDelete={deleteSubscriber.bind(null, row.id)}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-7 text-[14px] text-body-muted">
              No address matches that. Clear the filters to see all {rows.length}.
            </p>
          )}
        </>
      ) : (
        <p className="mt-7 text-[14px] text-body-muted">
          Nobody has asked for announcements yet. Addresses arrive here from the form on the news
          page.
        </p>
      )}
    </>
  )
}
