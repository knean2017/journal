import { InboxRow } from '@/components/admin/InboxRow'
import { requireAdmin } from '@/lib/admin/session'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Messages</h1>
      <div className="rule-double mt-5 mb-7" />

      {error ? (
        <p className="text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : data && data.length > 0 ? (
        <div className="border-t border-rule">
          {data.map((row) => (
            <InboxRow
              key={row.id}
              inbox="messages"
              item={{
                id: row.id,
                title: row.topic,
                subtitle: `${row.name} · ${new Date(row.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`,
                email: row.email,
                status: row.status,
                adminNotes: row.admin_notes ?? '',
                details: [{ label: 'Message', value: row.message }],
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-body-muted">
          No messages yet. They arrive here from the contact page.
        </p>
      )}
    </>
  )
}
