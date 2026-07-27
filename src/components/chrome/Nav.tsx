'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DRAWER_ITEMS, NAV_ITEMS, isNavItemActive, pageTitleFor } from '@/lib/nav-items'
import { Drawer } from './Drawer'

const SUBMIT_PILL =
  'flex-none bg-maroon text-cream px-[18px] py-[9px] text-[11.5px] tracking-[0.14em] uppercase font-bold whitespace-nowrap hover:bg-maroon-hover hover:text-cream'

/**
 * The two nav variants are different DOM, switched by a matchMedia listener
 * rather than by CSS display, matching the prototype.
 */
export function Nav({ deadline, contactEmail }: { deadline: string; contactEmail: string }) {
  const pathname = usePathname()
  const [narrow, setNarrow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)')
    setNarrow(mq.matches)
    const onChange = (e: MediaQueryListEvent) => {
      setNarrow(e.matches)
      // Crossing above 860px force-closes the drawer.
      if (!e.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav className="sticky top-0 z-40 bg-page rule-double border-b border-maroon">
        {narrow ? (
          <div className="max-w-[1180px] mx-auto px-[clamp(12px,4vw,40px)] flex items-center justify-between gap-3 min-h-[50px]">
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex flex-col gap-[4px] w-5 bg-transparent border-0 p-0 cursor-pointer"
            >
              <span
                className="block h-[1.5px] w-5 bg-maroon transition-transform duration-200"
                style={{ transform: menuOpen ? 'translateY(5.5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="block h-[1.5px] w-5 bg-maroon transition-opacity duration-200"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] w-5 bg-maroon transition-transform duration-200"
                style={{ transform: menuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }}
              />
            </button>
            <span className="font-serif text-[12.5px] text-gold-muted truncate min-w-0 flex-1 text-center">
              {pageTitleFor(pathname)}
            </span>
            <Link href="/submit" className={SUBMIT_PILL}>
              Submit
            </Link>
          </div>
        ) : (
          <div className="max-w-[1180px] mx-auto px-[clamp(12px,4vw,40px)] flex items-center justify-between gap-[clamp(10px,2vw,24px)] min-h-[50px]">
            <div
              className="flex-1 min-w-0 flex gap-[clamp(13px,2.2vw,30px)] flex-nowrap overflow-x-auto text-[clamp(10.5px,1.15vw,12.5px)] tracking-[0.13em] uppercase font-bold whitespace-nowrap"
              style={{ scrollbarWidth: 'none', justifyContent: 'safe center' }}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-[15px] text-ink-soft border-b-2"
                  style={{
                    borderBottomColor: isNavItemActive(item.href, pathname)
                      ? '#C0A265'
                      : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/submit" className={SUBMIT_PILL}>
              Submit
            </Link>
          </div>
        )}
      </nav>

      {narrow && menuOpen ? (
        <Drawer
          items={DRAWER_ITEMS}
          pathname={pathname}
          deadline={deadline}
          contactEmail={contactEmail}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  )
}
