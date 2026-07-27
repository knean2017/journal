import { InboxRow } from '@/components/admin/InboxRow'
import { requireAdmin } from '@/lib/admin/session'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function ReviewerApplicationsPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('reviewer_applications')
    .select('*, disciplines ( name )')
    .order('created_at', { ascending: false })

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Reviewer applications</h1>
      <div className="rule-double mt-5 mb-7" />

      {error ? (
        <p className="text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : data && data.length > 0 ? (
        <div className="border-t border-rule">
          {data.map((row) => (
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
        <p className="text-[14px] text-body-muted">
          No applications yet. They arrive here from the reviewer panel page.
        </p>
      )}
    </>
  )
}
