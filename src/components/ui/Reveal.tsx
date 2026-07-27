export function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section data-reveal className={className}>
      {children}
    </section>
  )
}
