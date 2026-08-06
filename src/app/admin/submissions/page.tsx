import { ListToolbar } from '@/components/admin/ListToolbar'
import { SubmissionRow } from '@/components/admin/SubmissionRow'
import { matchesQuery, matchesStatus, param } from '@/lib/admin/filter'
import { canDo, requireCapability } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireCapability('submissions', 'view')
  const canDelete = await canDo('submissions', 'edit')

  const filters = await searchParams
  const query = param(filters.q)
  const status = param(filters.status)
  const sort = param(filters.sort)

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*, disciplines ( name )')
    .order('created_at', { ascending: sort === 'oldest' })

  const rows = data ?? []
  const shown = rows.filter(
    (row) =>
      matchesStatus(status, row.status) &&
      matchesQuery(query, [
        row.title,
        row.corresponding_author,
        row.email,
        row.institution,
        row.disciplines?.name,
      ]),
  )

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Submissions</h1>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : rows.length > 0 ? (
        <>
          <ListToolbar
            action={`/${adminPath()}/submissions`}
            query={query}
            status={status}
            statuses={STATUSES}
            sort={sort}
            sortable
            placeholder="Title, author, institution"
            shown={shown.length}
            total={rows.length}
          />

          {shown.length > 0 ? (
            <div className="mt-6 border-t border-rule">
              {shown.map((row) => (
                <SubmissionRow
                  key={row.id}
                  canDelete={canDelete}
                  submission={{
                    id: row.id,
                    title: row.title,
                    correspondingAuthor: row.corresponding_author,
                    email: row.email,
                    institution: row.institution,
                    abstract: row.abstract,
                    section: row.disciplines?.name ?? 'Not set',
                    status: row.status,
                    adminNotes: row.admin_notes ?? '',
                    manuscriptPath: row.manuscript_path,
                    coverLetterPath: row.cover_letter_path,
                    createdAt: row.created_at,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-7 text-[14px] text-body-muted">
              No submission matches that. Clear the filters to see all {rows.length}.
            </p>
          )}
        </>
      ) : (
        <p className="mt-7 text-[14px] text-body-muted">
          No submissions yet. They arrive here once the submission form goes live.
        </p>
      )}
    </>
  )
}
