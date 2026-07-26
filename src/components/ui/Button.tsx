import Link from 'next/link'

type Variant = 'maroon' | 'gold' | 'outline' | 'outline-cream'

const VARIANTS: Record<Variant, string> = {
  maroon: 'btn-maroon',
  gold: 'btn-gold',
  outline: 'btn-outline',
  'outline-cream': 'btn-outline-cream',
}

export function Button({
  href,
  children,
  variant = 'maroon',
  full = false,
  className = '',
}: {
  href: string
  children: React.ReactNode
  variant?: Variant
  full?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`btn-base ${VARIANTS[variant]} ${full ? 'block w-full text-center' : ''} ${className}`}
    >
      {children}
    </Link>
  )
}
