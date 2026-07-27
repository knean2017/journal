export function Panel({
  children,
  tone = 'cream',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'cream' | 'page'
  className?: string
}) {
  const fill = tone === 'cream' ? 'bg-cream' : 'bg-page'
  return <div className={`${fill} border border-rule ${className}`}>{children}</div>
}
