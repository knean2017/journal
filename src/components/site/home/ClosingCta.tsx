import Link from 'next/link'

export function ClosingCta({ deadline }: { deadline: string }) {
  return (
    <section data-reveal className="mt-[76px] bg-maroon text-cream">
      <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[62px] text-center">
        <h2 className="m-0 font-serif text-[clamp(24px,4.4vw,34px)] font-normal leading-[1.35]">
          Have a paper you are proud of?
        </h2>
        <p
          className="mt-4 mx-auto max-w-[56ch] text-[16px] leading-[1.8]"
          style={{ color: 'rgba(247,244,239,.82)' }}
        >
          Submissions for Issue 1 close {deadline}. Manuscripts of 3,000–8,000 words in any of the
          five sections.
        </p>
        <div className="flex gap-[14px] justify-center flex-wrap mt-[30px]">
          {/* The only gold-filled button in the design. */}
          <Link
            href="/submit"
            className="btn-base btn-gold px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
          >
            Start a submission
          </Link>
          <Link
            href="/submit"
            className="btn-base btn-outline-cream px-[30px] py-[14px] text-[12.5px] tracking-[0.14em]"
          >
            Author guidelines
          </Link>
        </div>
      </div>
    </section>
  )
}
