import { AdminNav, type NavGroup } from '@/components/admin/AdminNav'
import { ENTITIES } from '@/lib/admin/entities'
import { areaForEntity, can, type Area } from '@/lib/admin/permissions'
import { currentAdmin, permissionMatrix } from '@/lib/admin/session'
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
  const matrix = await permissionMatrix()

  /** Cosmetic only. The pages and the actions behind these links gate themselves. */
  const visible = (area: Area | null) => Boolean(area) && can(matrix, user.role, area!, 'view')

  /*
   * Grouped by what you came to do. Everything that arrives from the public
   * site is in one place and carries its own count; everything that appears on
   * the site is in another; settings sit apart from both.
   *
   * Each link declares the area that governs it, and a group with nothing left
   * in it drops out rather than leaving an empty heading. A reviewer sees one
   * heading and one link.
   */
  const groups: NavGroup[] = [
    {
      title: 'Overview',
      links: [{ href: base, label: 'Dashboard', exact: true, area: 'dashboard' as Area }],
    },
    {
      title: 'Inbox',
      links: [
        {
          href: `${base}/submissions`,
          label: 'Submissions',
          count: counts.submissions,
          area: 'submissions' as Area,
        },
        {
          href: `${base}/reviewers`,
          label: 'Reviewer applications',
          count: counts.reviewers,
          area: 'applications' as Area,
        },
        {
          href: `${base}/editors`,
          label: 'Editor applications',
          count: counts.editors,
          area: 'applications' as Area,
        },
        {
          href: `${base}/messages`,
          label: 'Messages',
          count: counts.messages,
          area: 'messages' as Area,
        },
      ],
    },
    {
      title: 'Website content',
      links: [
        ...ENTITIES.map((entity) => ({
          href: `${base}/${entity.slug}`,
          label: entity.plural,
          area: areaForEntity(entity.slug),
        })),
        { href: `${base}/media`, label: 'Media', area: 'media' as Area },
      ],
    },
    {
      title: 'Settings',
      links: [
        { href: `${base}/config`, label: 'Site settings', area: 'settings' as Area },
        { href: `${base}/people`, label: 'People and permissions', area: 'people' as Area },
      ],
    },
  ]
    .map((group) => ({ ...group, links: group.links.filter((link) => visible(link.area)) }))
    .filter((group) => group.links.length > 0)

  return (
    <div className="min-h-screen bg-page grid [grid-template-columns:minmax(0,1fr)] md:[grid-template-columns:250px_minmax(0,1fr)] md:items-start">
      <AdminNav groups={groups} email={user.email} />

      <main className="px-[clamp(20px,4vw,44px)] py-9 min-w-0">{children}</main>
    </div>
  )
}
