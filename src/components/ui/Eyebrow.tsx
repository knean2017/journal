export function Eyebrow({
  children,
  tone = 'muted',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'gold'
  className?: string
}) {
  const color = tone === 'gold' ? 'text-gold' : 'text-gold-muted'
  return <div className={`eyebrow ${color} ${className}`}>{children}</div>
}
