import { Container } from './Container'

export function PageHead({
  title,
  lead,
  centered = false,
}: {
  title: React.ReactNode
  lead?: React.ReactNode
  centered?: boolean
}) {
  return (
    <Container
      className={`pt-[clamp(38px,6vw,56px)] pb-[clamp(24px,4vw,34px)] ${centered ? 'text-center' : ''}`}
    >
      <h1
        className={`font-serif font-normal text-[clamp(27px,5.4vw,44px)] leading-[1.22] text-ink max-w-[22ch] m-0 ${centered ? 'mx-auto' : ''}`}
      >
        {title}
      </h1>
      {lead ? (
        <p
          className={`font-sans text-[15.5px] leading-[1.85] text-body max-w-[68ch] mt-[18px] ${centered ? 'mx-auto' : ''}`}
        >
          {lead}
        </p>
      ) : null}
      <div className="rule-double mt-[clamp(24px,4vw,34px)]" />
    </Container>
  )
}
