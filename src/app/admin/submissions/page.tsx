import { SubmissionRow } from '@/components/admin/SubmissionRow'
import { requireAdmin } from '@/lib/admin/session'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*, disciplines ( name )')
    .order('created_at', { ascending: false })

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Submissions</h1>
      <div className="rule-double mt-5 mb-7" />

      {error ? (
        <p className="text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : data && data.length > 0 ? (
        <div className="border-t border-rule">
          {data.map((row) => (
            <SubmissionRow
              key={row.id}
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
                createdAt: row.created_at,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-body-muted">
          No submissions yet. They arrive here once the submission form goes live.
        </p>
      )}
    </>
  )
}
