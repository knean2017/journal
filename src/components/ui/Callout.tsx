export function Callout({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`callout-gold ${className}`}>{children}</div>
}
