import type { ProcessStep } from '@/lib/content'

export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-16">
      <div className="rule-double-bottom pb-3">
        <h2 className="m-0 font-serif text-[clamp(22px,3.4vw,30px)] font-normal">
          From submission to publication
        </h2>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))] mt-[34px]">
        {steps.map((step) => (
          <div key={step.number} className="pr-[26px] pl-[22px] border-l border-rule">
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
