import type { ProcessStep } from '@/lib/content'

export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  /*
   * The steps are entered in the panel and the table starts empty, so there is
   * a state where there are none. The heading belongs to this section, and a
   * heading with nothing under it reads as something that failed to load.
   */
  if (steps.length === 0) return null

  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-16">
      <div className="rule-double-bottom pb-3">
        <h2 className="m-0 font-serif text-[clamp(22px,3.4vw,30px)] font-normal">
          From submission to publication
        </h2>
      </div>

      {/*
       * The rule that divides the steps runs down their left edge in a row and
       * across their top in a column. Kept on the left in both, four stacked
       * steps shared one continuous line with no space between them and read
       * as a single block of text.
       */}
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))] mt-[34px] border-t border-rule sm:border-t-0">
        {steps.map((step) => (
          <div
            key={step.number}
            className="py-[18px] pr-[26px] border-b border-rule sm:py-0 sm:border-b-0 sm:pl-[22px] sm:border-l"
          >
            <div className="flex items-center gap-[10px]">
              <span className="w-[26px] h-[26px] border border-gold text-maroon flex items-center justify-center font-serif text-[12px]">
                {step.number}
              </span>
              <span className="text-[11px] tracking-[0.18em] uppercase text-gold-muted font-bold">
                {step.time}
              </span>
            </div>
            <h3 className="mt-[14px] mb-0 font-serif text-[18px] font-bold">{step.title}</h3>
            <p className="mt-2 mb-0 text-[13.5px] leading-[1.75] text-body-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
