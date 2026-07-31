import { AdminNav, type NavGroup } from '@/components/admin/AdminNav'
import { ENTITIES } from '@/lib/admin/entities'
import { currentAdmin } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import '@/styles/globals.css'

export const metadata = {
  title: 'ICRR editorial office',
  robots: { index: false, follow: false },
}

/**
 * What is waiting in each inbox, for the badges in the navigation.
 *
 * Four counting queries on every admin page, which is the price of being able
 * to see from any screen that something has arrived. They are head-only counts,
 * and a panel with one editor does not navigate often enough for it to matter.
 * A database that cannot be reached returns no counts rather than an error
 * page: the navigation still has to render so you can get somewhere else.
 */
async function inboxCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createSupabaseServiceClient()
    const [submissions, reviewers, editors, messages] = await Promise.all([
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase
        .from('reviewer_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('editor_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
    ])

    return {
      submissions: submissions.count ?? 0,
      reviewers: reviewers.count ?? 0,
      editors: editors.count ?? 0,
      messages: messages.count ?? 0,
    }
  } catch {
    return {}
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentAdmin()

  // The login page renders inside this layout too, without the chrome.
  if (!user) return <div className="min-h-screen bg-page">{children}</div>

  const base = `/${adminPath()}`
  const counts = await inboxCounts()

  /*
   * Grouped by what you came to do. Everything that arrives from the public
   * site is in one place and carries its own count; everything that appears on
   * the site is in another; settings sit apart from both.
   */
  const groups: NavGroup[] = [
    {
      title: 'Overview',
      links: [{ href: base, label: 'Dashboard', exact: true }],
    },
    {
      title: 'Inbox',
      links: [
        { href: `${base}/submissions`, label: 'Submissions', count: counts.submissions },
        { href: `${base}/reviewers`, label: 'Reviewer applications', count: counts.reviewers },
        { href: `${base}/editors`, label: 'Editor applications', count: counts.editors },
        { href: `${base}/messages`, label: 'Messages', count: counts.messages },
      ],
    },
    {
      title: 'Website content',
      links: [
        ...ENTITIES.map((entity) => ({ href: `${base}/${entity.slug}`, label: entity.plural })),
        { href: `${base}/media`, label: 'Media' },
      ],
    },
    {
      title: 'Settings',
      links: [{ href: `${base}/config`, label: 'Site settings' }],
    },
  ]

  return (
    <div className="min-h-screen bg-page grid [grid-template-columns:minmax(0,1fr)] md:[grid-template-columns:250px_minmax(0,1fr)] md:items-start">
      <AdminNav groups={groups} email={user.email} />

      <main className="px-[clamp(20px,4vw,44px)] py-9 min-w-0">{children}</main>
    </div>
  )
}
