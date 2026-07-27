'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { TickerLine } from '@/lib/content'

const ROTATE_MS = 6000

export function AnnouncementBar({ lines }: { lines: TickerLine[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (lines.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % lines.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [lines.length])

  return (
    <section className="mt-14 bg-maroon text-cream">
      <div className="max-w-[1180px] mx-auto px-[clamp(16px,5vw,40px)] py-4 flex items-center gap-[26px] flex-wrap min-h-[56px]">
        <span className="flex items-center gap-[9px] text-[11px] tracking-[0.2em] uppercase font-bold text-gold flex-none">
          {/* The one round corner in the design, per the prototype. */}
          <span
            className="w-[6px] h-[6px] bg-gold"
            style={{ borderRadius: '50%', animation: 'icrrPulse 2.4s ease-in-out infinite' }}
          />
          Latest
        </span>

        <span
          aria-live="polite"
          className="font-serif text-[16px] leading-[1.6] flex-1 min-w-[280px] transition-opacity duration-[400ms]"
        >
          {lines[index]?.text}
        </span>

        <Link
          href="/news"
          className="text-gold text-[11.5px] tracking-[0.16em] uppercase font-bold flex-none"
        >
          All announcements
        </Link>
      </div>
    </section>
  )
}
