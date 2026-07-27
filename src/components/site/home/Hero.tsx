import Link from 'next/link'
import { Fragment } from 'react'

export function Hero({ issueLabel }: { issueLabel: string }) {
  /*
   * The label breaks between its parts, never inside one. On a phone the whole
   * of it does not fit on a line, and left to itself it split "Publishing 30 /
   * September 2026" across the break. The separators stay outside the nowrap
   * spans, because they are the only places a break is wanted.
   */
  const labelParts = issueLabel.split('·').map((part) => part.trim())

  return (
    <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-16 pb-[30px] text-center">
      <div
        className="text-[11.5px] tracking-[0.24em] uppercase text-gold-muted font-bold"
        style={{ animation: 'icrrUp .6s ease both' }}
      >
        {labelParts.map((part, index) => (
          <Fragment key={part}>
            {index > 0 ? ' · ' : null}
            <span className="whitespace-nowrap">{part}</span>
          </Fragment>
        ))}
      </div>

      {/*
         Two block spans, not a line break inside one line of text: the second
         half must start its own row at every width, and a wrap point would let
         a wide viewport pull "across borders." back up beside the first half.
      */}
      <h1
        className="mt-[18px] mx-auto max-w-[22ch] font-serif text-[clamp(29px,6.3vw,52px)] leading-[1.2] font-normal tracking-[-0.01em]"
        style={{ animation: 'icrrUp .7s ease .06s both' }}
      >
        <span className="block">Connecting researches</span>
        <em className="block text-maroon">across borders.</em>
      </h1>

      {/* Draws its own width from zero. */}
      <div
        className="h-[2px] w-24 bg-gold mt-[26px] mx-auto"
        style={{ animation: 'icrrDraw .9s cubic-bezier(.2,.7,.2,1) .35s both' }}
      />

      <p
        className="mt-[26px] mx-auto max-w-[64ch] text-[clamp(15px,1.7vw,16.5px)] leading-[1.85] text-body"
        style={{ animation: 'icrrUp .7s ease .14s both' }}
      >
        An independent, open-access journal publishing undergraduate and graduate research across
        five sections. Submissions are open for our first issue.
      </p>

      {/*
       * Stacked, the two buttons sized themselves to their labels and came out
       * ragged. On a phone they match each other's width; from 640px up they
       * sit side by side at their natural size, as before.
       */}
      <div
        className="flex flex-col sm:flex-row items-center gap-[14px] justify-center mt-8"
        style={{ animation: 'icrrUp .7s ease .22s both' }}
      >
        <Link
          href="/submit"
          className="btn-base btn-maroon w-full max-w-[320px] sm:w-auto text-center px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
        >
          Submit a Manuscript
        </Link>
        <Link
          href="/news"
          className="btn-base btn-outline w-full max-w-[320px] sm:w-auto text-center px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
        >
          Read the Call for Papers
        </Link>
      </div>
    </section>
  )
}
