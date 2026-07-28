import { InboxRow } from '@/components/admin/InboxRow'
import { requireAdmin } from '@/lib/admin/session'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function EditorApplicationsPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('editor_applications')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Editor applications</h1>
      <div className="rule-double mt-5 mb-7" />

      {error ? (
        <p className="text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : data && data.length > 0 ? (
        <div className="border-t border-rule">
          {data.map((row) => (
            <InboxRow
              key={row.id}
              inbox="editors"
              item={{
                id: row.id,
                title: row.name,
                subtitle: `${row.role} · ${row.position} · ${row.affiliation}`,
                email: row.email,
                status: row.status,
                adminNotes: row.admin_notes ?? '',
                details: [
                  { label: 'Role applied for', value: row.role },
                  { label: 'Statement of interest', value: row.statement },
                  { label: 'Editorial experience', value: row.experience || 'Not given.' },
                  { label: 'ORCID', value: row.orcid || 'Not given.' },
                ],
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-body-muted">
          No applications yet. They arrive here from the editorial roles page.
        </p>
      )}
    </>
  )
}
