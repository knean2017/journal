/**
 * Shared furniture for the three policy pages.
 *
 * They are long documents rather than designed views, so they get one narrow
 * measure, numbered headings that can be linked to, and nothing else. The
 * `id` on each section is what a footer link or an email can point at.
 */

export function PolicyBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9 pb-4">
      <div className="max-w-[70ch] flex flex-col gap-9">{children}</div>
    </div>
  )
}

export function PolicySection({
  id,
  heading,
  children,
}: {
  id: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-[70px]">
      <h2 className="m-0 font-serif text-[21px] leading-[1.35] font-bold text-maroon">{heading}</h2>
      <div className="flex flex-col gap-[14px] mt-[10px] text-[15px] leading-[1.85] text-body">
        {children}
      </div>
    </section>
  )
}

/** A labelled block, for the "what each form collects" lists. */
export function PolicyList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="m-0 flex flex-col gap-[14px]">
      {items.map((item) => (
        <div key={item.term} className="border-l-2 border-rule pl-4">
          <dt className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
            {item.term}
          </dt>
          <dd className="m-0 mt-[6px] text-[14.5px] leading-[1.8] text-body">{item.detail}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Marks the few facts nobody but the journal can supply.
 *
 * Left deliberately loud. A registered name and a postal address are required
 * of a data controller, and a quiet grey placeholder is how a document goes
 * live with the placeholder still in it.
 */
export function ToFill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-maroon bg-cream px-[6px] py-[2px] text-[13px] font-bold text-maroon">
      {children}
    </span>
  )
}

export function PolicyUpdated({ date }: { date: string }) {
  return (
    <p className="m-0 text-[13px] tracking-[0.12em] uppercase font-bold text-gold-muted">
      Last updated {date}
    </p>
  )
}
