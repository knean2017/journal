import Image from 'next/image'

/**
 * Renders an image when the content layer supplies a path, and an on-brand
 * labelled placeholder when it does not. Paths always come from content data,
 * never from JSX, so filling a slot is a data change.
 */
export function ImageSlot({
  src,
  label,
  ratio,
  priority = false,
  className = '',
}: {
  src: string | null
  label: string
  ratio: string
  priority?: boolean
  className?: string
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
        <Image src={src} alt={label} fill priority={priority} className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`grid place-items-center border border-dashed border-rule bg-page p-4 text-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="eyebrow text-gold-muted">{label}</span>
    </div>
  )
}
