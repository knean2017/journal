import { ListToolbar } from '@/components/admin/ListToolbar'
import { matchesQuery, matchesStatus, param } from '@/lib/admin/filter'
import { requireCapability } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

/**
 * Who asked for announcements, and who has since left.
 *
 * Read-only, deliberately. Nobody adds an address here: consent has to come
 * from the person who owns the address, and a field on this page would be a
 * way to put someone on a mailing list who never asked. Nobody removes one
 * either: the unsubscribe link does that, and it records when.
 */

const STATUSES = [
  { value: 'active', label: 'Subscribed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
]

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

  const filters = await searchParams
  const query = param(filters.q)
  const status = param(filters.status)
  const sort = param(filters.sort)

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, is_active, created_at, unsubscribed_at')
    .order('created_at', { ascending: sort === 'oldest' })

  const rows = data ?? []
  const shown = rows.filter(
    (row) =>
      matchesStatus(status, row.is_active ? 'active' : 'unsubscribed') &&
      matchesQuery(query, [row.email]),
  )

  const active = rows.filter((row) => row.is_active).length

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Announcement list</h1>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : rows.length > 0 ? (
        <>
          <p className="mt-6 mb-0 text-[14px] leading-[1.8] text-body">
            <strong>{active}</strong> {active === 1 ? 'address is' : 'addresses are'} subscribed
            {rows.length > active ? `, and ${rows.length - active} have unsubscribed` : ''}. People
            add themselves from the news page and remove themselves from the link at the foot of
            every announcement, so this list is not edited here.
          </p>

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
                <div
                  key={row.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-3"
                >
                  <span className="text-[14px] text-body">{row.email}</span>
                  <span className="text-[13px] text-body-muted">
                    {row.is_active
                      ? `Subscribed ${date(row.created_at)}`
                      : `Unsubscribed ${date(row.unsubscribed_at)}`}
                  </span>
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
