'use client'

import Link from 'next/link'
import { isNavItemActive } from '@/lib/nav-items'

export function Drawer({
  items,
  pathname,
  deadline,
  contactEmail,
  onClose,
}: {
  items: readonly { href: string; label: string }[]
  pathname: string
  deadline: string
  contactEmail: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ background: 'rgba(36,31,30,.5)', animation: 'icrrIn .2s ease both' }}
      onClick={onClose}
    >
      <aside
        className="absolute right-0 top-0 h-full w-[min(86vw,340px)] bg-page flex flex-col"
        style={{
          borderLeft: '3px double #5D1D21',
          animation: 'icrrDrawer .3s cubic-bezier(.2,.7,.2,1) both',
        }}
        // Clicks inside the sheet must not reach the scrim handler.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[22px] py-4 border-b border-rule-light">
          <span className="eyebrow">Navigation</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="bg-transparent border-0 text-[20px] leading-none text-maroon cursor-pointer p-0"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {items.map((item) => {
            const active = isNavItemActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between font-serif text-[17px] px-[22px] py-4 border-b border-rule-light hover:bg-cream"
                style={{ color: active ? '#5D1D21' : '#241F1E' }}
              >
                {item.label}
                {active ? <span className="eyebrow text-gold">Current</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className="px-[22px] py-5 border-t border-rule-light">
          <Link
            href="/submit"
            onClick={onClose}
            className="btn-base btn-maroon block w-full text-center"
          >
            Submit
          </Link>
          <p className="text-[12.5px] text-body-muted mt-3 mb-0">
            Issue 1 submissions close {deadline}.
          </p>
          <p className="text-[12.5px] text-body-muted mt-1 mb-0">{contactEmail}</p>
        </div>
      </aside>
    </div>
  )
}
