const VALUES = [
  {
    number: '01',
    title: 'Double-blind peer review',
    body: 'Every submission is assessed by at least two subject-specialist reviewers.',
  },
  {
    number: '02',
    title: 'Open access, no fees',
    body: 'Free to read and free to publish. Authors retain copyright under CC BY 4.0.',
  },
  {
    number: '03',
    title: 'Multidisciplinary',
    body: 'Five sections and one review board, so interdisciplinary work has somewhere to go.',
  },
]

export function ValueColumns() {
  return (
    <section
      data-reveal
      className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] [&>div]:border-b [&>div]:border-rule"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
        {VALUES.map((value, i) => (
          <div
            key={value.number}
            className="py-[clamp(26px,3.4vw,38px)] border-b border-rule"
            style={{
              paddingRight: i === 2 ? 0 : 'clamp(0px,2.4vw,34px)',
              paddingLeft: i === 0 ? 0 : 'clamp(0px,2.4vw,34px)',
            }}
          >
            <div className="font-serif text-[13px] text-gold">{value.number}</div>
            <h3 className="mt-3 mb-0 font-serif text-[21px] font-bold text-maroon">
              {value.title}
            </h3>
            <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.8] text-body">{value.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
