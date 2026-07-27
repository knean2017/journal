import Link from 'next/link'

export function Hero({ issueLabel }: { issueLabel: string }) {
  return (
    <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-16 pb-[30px] text-center">
      <div
        className="text-[11.5px] tracking-[0.24em] uppercase text-gold-muted font-bold"
        style={{ animation: 'icrrUp .6s ease both' }}
      >
        {issueLabel}
      </div>

      <h1
        className="mt-[18px] mx-auto max-w-[22ch] font-serif text-[clamp(29px,6.3vw,52px)] leading-[1.2] font-normal tracking-[-0.01em]"
        style={{ animation: 'icrrUp .7s ease .06s both' }}
      >
        Connecting researches <em className="text-maroon">across borders.</em>
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

      <div
        className="flex gap-[14px] justify-center flex-wrap mt-8"
        style={{ animation: 'icrrUp .7s ease .22s both' }}
      >
        <Link
          href="/submit"
          className="btn-base btn-maroon px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
        >
          Submit a Manuscript
        </Link>
        <Link
          href="/news"
          className="btn-base btn-outline px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
        >
          Read the Call for Papers
        </Link>
      </div>
    </section>
  )
}
