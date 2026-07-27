export function PageHead({
  eyebrow,
  title,
  lead,
  centered = false,
  maxWidth = '26ch',
  rule = 'double',
}: {
  eyebrow: string
  title: React.ReactNode
  lead?: React.ReactNode
  centered?: boolean
  maxWidth?: string
  rule?: 'double' | 'double-hairline'
}) {
  return (
    <section
      className={`max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[clamp(38px,6vw,56px)] ${centered ? 'text-center' : ''}`}
    >
      <div className="text-[11.5px] tracking-[0.24em] uppercase text-gold-muted font-bold">
        {eyebrow}
      </div>

      <h1
        className={`mt-[14px] mb-0 font-serif text-[clamp(27px,5.4vw,44px)] leading-[1.22] font-normal ${centered ? 'mx-auto' : ''}`}
        style={{ maxWidth }}
      >
        {title}
      </h1>

      {lead ? (
        <p
          className={`mt-[14px] mb-0 max-w-[66ch] text-[16px] leading-[1.8] text-body ${centered ? 'mx-auto' : ''}`}
        >
          {lead}
        </p>
      ) : null}

      <div
        className="mt-7"
        style={
          rule === 'double-hairline'
            ? { borderTop: '3px double #5D1D21', borderBottom: '1px solid #5D1D21' }
            : { borderBottom: '3px double #5D1D21' }
        }
      />
    </section>
  )
}
