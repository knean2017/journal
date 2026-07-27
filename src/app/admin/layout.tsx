import Link from 'next/link'
import { signOut } from '@/lib/admin/actions'
import { ENTITIES } from '@/lib/admin/entities'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import '@/styles/globals.css'

export const metadata = {
  title: 'ICRR editorial office',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The login page renders inside this layout too, without the chrome.
  if (!user) return <div className="min-h-screen bg-page">{children}</div>

  const base = `/${adminPath()}`
  const links = [
    { href: base, label: 'Dashboard' },
    { href: `${base}/config`, label: 'Site settings' },
    ...ENTITIES.map((entity) => ({ href: `${base}/${entity.slug}`, label: entity.plural })),
    { href: `${base}/media`, label: 'Media' },
    { href: `${base}/submissions`, label: 'Submissions' },
    { href: `${base}/reviewers`, label: 'Reviewer applications' },
    { href: `${base}/messages`, label: 'Messages' },
  ]

  return (
    <div className="min-h-screen bg-page grid [grid-template-columns:minmax(0,1fr)] md:[grid-template-columns:240px_minmax(0,1fr)]">
      <aside className="bg-maroon text-cream px-6 py-7 flex flex-col gap-6">
        <div>
          <div className="eyebrow text-gold">ICRR</div>
          <div className="font-serif text-[17px] mt-1">Editorial office</div>
        </div>

        <nav className="flex flex-col gap-[2px] flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] py-[7px] hover:bg-maroon-hover px-2 -mx-2"
              style={{ color: 'rgba(247,244,239,.82)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={signOut}>
          <div className="text-[11.5px] mb-2" style={{ color: 'rgba(247,244,239,.6)' }}>
            {user.email}
          </div>
          <button type="submit" className="btn-base btn-outline-cream w-full">
            Sign out
          </button>
        </form>
      </aside>

      <main className="px-[clamp(20px,4vw,44px)] py-9 min-w-0">{children}</main>
    </div>
  )
}
