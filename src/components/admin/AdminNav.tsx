'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/admin/actions'

export type NavLink = {
  href: string
  label: string
  /** Waiting items, shown as a badge. Absent or zero shows nothing. */
  count?: number
  /** Dashboard only: every other page sits under it, so it cannot match by prefix. */
  exact?: boolean
  /**
   * The permission area that governs this link. The layout filters on it before
   * rendering, so by the time a link is here it has already been allowed. Null
   * means no area is mapped, which the layout treats as not visible.
   */
  area?: string | null
}

export type NavGroup = { title: string; links: NavLink[] }

/**
 * The editorial office's own navigation.
 *
 * Three things it has to do that a plain list of links did not. Say where you
 * are, because fourteen links with no highlight leave you reading the heading
 * to find out. Say what is waiting, so the inbox is worth opening only when it
 * is. And fold away on a phone, where a full-height maroon column used to sit
 * on top of every page before you could read a word of it.
 */
export function AdminNav({
  groups,
  email,
}: {
  groups: NavGroup[]
  email: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isCurrent = (link: NavLink) =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-4 bg-maroon text-cream px-5 py-[10px]">
        <div>
          <div className="eyebrow text-gold">ICRR</div>
          <div className="font-serif text-[15px]">Editorial office</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="btn-base btn-outline-cream px-[14px] py-[9px]"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <aside
        id="admin-nav"
        className={`${open ? 'block' : 'hidden'} md:block bg-maroon text-cream px-5 py-6 md:px-6 md:py-7 md:sticky md:top-0 md:h-screen md:overflow-y-auto`}
      >
        <div className="hidden md:block mb-6">
          <div className="eyebrow text-gold">ICRR</div>
          <div className="font-serif text-[17px] mt-1">Editorial office</div>
        </div>

        <nav className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-[rgba(247,244,239,0.45)] mb-[6px]">
                {group.title}
              </div>
              <div className="flex flex-col gap-[1px]">
                {group.links.map((link) => {
                  const current = isCurrent(link)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      // Following a link on a phone leaves the menu behind, not on top.
                      onClick={() => setOpen(false)}
                      aria-current={current ? 'page' : undefined}
                      className={`flex items-center justify-between gap-3 text-[13px] py-[7px] px-2 -mx-2 ${
                        current
                          ? 'bg-cream text-maroon font-bold hover:text-maroon'
                          : 'text-[rgba(247,244,239,0.82)] hover:bg-maroon-hover hover:text-cream'
                      }`}
                    >
                      <span className="truncate">{link.label}</span>
                      {link.count ? (
                        <span
                          /* Named for a screen reader: a bare number beside a link says nothing. */
                          aria-label={`${link.count} new`}
                          className={`flex-none min-w-[20px] text-center text-[11px] font-bold px-[6px] py-[1px] ${
                            current ? 'bg-maroon text-cream' : 'bg-gold text-maroon-deep'
                          }`}
                        >
                          {link.count}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <form action={signOut} className="mt-7 pt-5 border-t border-[rgba(247,244,239,0.2)]">
          <div className="text-[11.5px] mb-2 text-[rgba(247,244,239,0.6)] break-words">{email}</div>
          <button type="submit" className="btn-base btn-outline-cream w-full">
            Sign out
          </button>
        </form>
      </aside>
    </>
  )
}
