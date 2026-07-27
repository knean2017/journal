import Link from 'next/link'
import type { TickerLine } from '@/lib/content'

/**
 * Seconds per character of announcement text. The track is as wide as the text
 * it holds, so the duration has to scale with it or three long announcements
 * would race past while one short one crawled.
 */
const SECONDS_PER_CHARACTER = 0.11

/**
 * The announcements slide past continuously rather than swapping every six
 * seconds. A swap loses whatever you were half way through reading; a slide
 * never does, and it needs no client state at all.
 *
 * Under `prefers-reduced-motion` the global rule in globals.css collapses the
 * animation, which parks the track at its start. The duplicate run is clipped
 * by the overflow, so the bar simply reads as static text.
 */
export function AnnouncementBar({ lines }: { lines: TickerLine[] }) {
  if (lines.length === 0) return null

  const characters = lines.reduce((total, line) => total + line.text.length, 0)
  const duration = Math.max(30, Math.round(characters * SECONDS_PER_CHARACTER))

  return (
    <section className="mt-14 bg-maroon text-cream">
      {/*
       * On a phone the label and the link share the top line and the sliding
       * text gets the full width beneath them. Squeezed onto one row the text
       * had 240px to move in, which is barely a phrase, and the link was
       * pushed onto a line of its own looking stranded.
       */}
      <div className="max-w-[1180px] mx-auto px-[clamp(16px,5vw,40px)] py-4 flex items-center flex-wrap gap-x-[26px] gap-y-[10px] min-h-[56px]">
        <span className="flex items-center gap-[9px] text-[11px] tracking-[0.2em] uppercase font-bold text-gold flex-none order-1">
          {/* The one round corner in the design, per the prototype. */}
          <span
            className="w-[6px] h-[6px] bg-gold"
            style={{ borderRadius: '50%', animation: 'icrrPulse 2.4s ease-in-out infinite' }}
          />
          Latest
        </span>

        <Link
          href="/news"
          className="text-gold text-[11.5px] tracking-[0.16em] uppercase font-bold flex-none order-2 ml-auto sm:order-3 sm:ml-0"
        >
          All announcements
        </Link>

        <div className="ticker w-full order-3 sm:order-2 sm:w-auto sm:flex-1 sm:min-w-[240px]">
          <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
            <TickerRun lines={lines} />
            {/*
             * The second run is what makes the loop seamless: the track slides
             * exactly one run's width, so the copy lands where the original
             * started. It is duplicate text, so it is hidden from readers.
             */}
            <TickerRun lines={lines} aria-hidden />
          </div>
        </div>
      </div>
    </section>
  )
}

function TickerRun({ lines, ...rest }: { lines: TickerLine[]; 'aria-hidden'?: boolean }) {
  return (
    <span className="flex flex-none items-center font-serif text-[16px] leading-[1.6]" {...rest}>
      {lines.map((line) => (
        <span key={line.text} className="flex flex-none items-center">
          {line.text}
          {/* Separator after every line, including the last, so the seam reads
              like any other gap between announcements. */}
          <span className="text-gold px-[26px]" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </span>
  )
}
