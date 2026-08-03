import { InboxRow } from '@/components/admin/InboxRow'
import { ListToolbar } from '@/components/admin/ListToolbar'
import { INBOX_STATUSES } from '@/lib/admin/entities'
import { matchesQuery, matchesStatus, param } from '@/lib/admin/filter'
import { requireCapability } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function ReviewerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireCapability('applications', 'view')

  const filters = await searchParams
  const query = param(filters.q)
  const status = param(filters.status)
  const sort = param(filters.sort)

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('reviewer_applications')
    .select('*, disciplines ( name )')
    .order('created_at', { ascending: sort === 'oldest' })

  const rows = data ?? []
  const shown = rows.filter(
    (row) =>
      matchesStatus(status, row.status) &&
      matchesQuery(query, [
        row.name,
        row.email,
        row.affiliation,
        row.position,
        row.expertise,
        row.disciplines?.name,
      ]),
  )

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Reviewer applications</h1>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : rows.length > 0 ? (
        <>
          <ListToolbar
            action={`/${adminPath()}/reviewers`}
            query={query}
            status={status}
            statuses={INBOX_STATUSES}
            sort={sort}
            sortable
            placeholder="Name, affiliation, expertise"
            shown={shown.length}
            total={rows.length}
          />

          {shown.length > 0 ? (
            <div className="mt-6 border-t border-rule">
              {shown.map((row) => (
                <InboxRow
                  key={row.id}
                  inbox="reviewers"
                  item={{
                    id: row.id,
                    title: row.name,
                    subtitle: `${row.position} · ${row.affiliation} · ${row.disciplines?.name ?? 'No section'}`,
                    email: row.email,
                    status: row.status,
                    adminNotes: row.admin_notes ?? '',
                    details: [
                      { label: 'Areas of expertise', value: row.expertise },
                      { label: 'Review experience', value: row.experience || 'Not given.' },
                      { label: 'ORCID', value: row.orcid || 'Not given.' },
                    ],
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-7 text-[14px] text-body-muted">
              No application matches that. Clear the filters to see all {rows.length}.
            </p>
          )}
        </>
      ) : (
        <p className="mt-7 text-[14px] text-body-muted">
          No applications yet. They arrive here from the reviewer panel page.
        </p>
      )}
    </>
  )
}
