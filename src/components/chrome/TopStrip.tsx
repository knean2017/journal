import Link from 'next/link'

const CREAM_82 = { color: 'rgba(247,244,239,.82)' }

export function TopStrip() {
  return (
    <div className="bg-maroon text-[11px] uppercase tracking-[0.16em]" style={CREAM_82}>
      {/*
       * Centred until the two halves fit on one line, then pushed apart. With
       * `justify-between` alone a phone got two left-aligned lines with a
       * ragged gap between them, which reads as a wrap that nobody intended.
       */}
      <div className="max-w-[1180px] mx-auto px-[clamp(16px,5vw,40px)] py-2 flex justify-center sm:justify-between gap-x-5 gap-y-[6px] flex-wrap text-center">
        <span>Open Access · ISSN Pending · Est. 2026</span>
        <span className="flex gap-[22px]">
          <Link href="/contact" style={CREAM_82}>
            Contact
          </Link>
          <Link href="/news" style={CREAM_82}>
            Announcements
          </Link>
        </span>
      </div>
    </div>
  )
}
