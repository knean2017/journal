export function Container({
  children,
  width = 'content',
  className = '',
}: {
  children: React.ReactNode
  width?: 'content' | 'wide'
  className?: string
}) {
  const max = width === 'wide' ? 'max-w-[1400px]' : 'max-w-[1180px]'
  return <div className={`${max} mx-auto px-[clamp(18px,5vw,40px)] ${className}`}>{children}</div>
}
