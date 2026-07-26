import Image from 'next/image'
import Link from 'next/link'

export function Masthead() {
  return (
    <header
      className="text-center px-[clamp(16px,5vw,40px)] pt-[clamp(14px,4vw,10px)] pb-[clamp(18px,3vw,8px)]"
      style={{ animation: 'icrrIn .6s ease both' }}
    >
      <Link href="/" className="inline-block">
        <Image
          src="/brand/lockup-full.png"
          alt="International Collegiate Research Review"
          width={454}
          height={126}
          priority
          className="h-[126px] w-[454px] max-w-full object-contain block"
        />
      </Link>
    </header>
  )
}
