import Image from 'next/image'
import Link from 'next/link'

export function Masthead() {
  return (
    <header
      className="text-center px-[clamp(16px,5vw,40px)] pt-[clamp(16px,3vw,24px)] pb-[clamp(14px,2.5vw,20px)]"
      style={{ animation: 'icrrIn .6s ease both' }}
    >
      <Link href="/" className="inline-block">
        {/*
         * Sized by height, with width/height set to the file's real 2500x600
         * ratio. The earlier 454x126 box did not match the artwork, so
         * object-contain letterboxed it and the lockup drew smaller than the
         * number said.
         */}
        <Image
          src="/brand/lockup-full.png"
          alt="International Collegiate Research Review"
          width={1250}
          height={300}
          priority
          className="h-[clamp(72px,9.5vw,92px)] w-auto max-w-full block"
        />
      </Link>
    </header>
  )
}
