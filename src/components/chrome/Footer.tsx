import Image from 'next/image'
import Link from 'next/link'

const CREAM_78 = { color: 'rgba(247,244,239,.78)' }

const COLUMNS = [
  {
    head: 'The journal',
    links: [
      { href: '/about', label: 'About' },
      { href: '/issue/current', label: 'Current issue' },
      { href: '/archives', label: 'Archives' },
      { href: '/team', label: 'Our team' },
    ],
  },
  {
    head: 'For authors',
    links: [
      { href: '/submit', label: 'Submit' },
      { href: '/submit', label: 'Author guidelines' },
      { href: '/authors', label: 'Contributor directory' },
      { href: '/news', label: 'Announcements' },
    ],
  },
]

export function Footer({ contactEmail }: { contactEmail: string }) {
  return (
    <footer className="mt-[88px] bg-maroon" style={CREAM_78}>
      <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[clamp(38px,5vw,54px)] grid gap-[clamp(28px,4vw,44px)] [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {/* Standalone square mark, never the full lockup on a cream plate. */}
        <div className="flex items-center gap-[18px]">
          <Image
            src="/brand/mark.png"
            alt=""
            width={74}
            height={74}
            className="w-[clamp(58px,12vw,74px)] h-auto"
          />
          <span
            className="font-serif uppercase text-cream text-[clamp(11px,1.2vw,12.5px)] tracking-[0.16em] pl-[18px]"
            style={{ borderLeft: '1px solid rgba(192,162,101,.55)' }}
          >
            International Collegiate
            <br />
            Research Review
          </span>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.head}>
            <div className="eyebrow text-gold mb-4">{column.head}</div>
            <ul className="list-none p-0 m-0 grid gap-[10px]">
              {column.links.map((link) => (
                <li key={`${column.head}-${link.label}`}>
                  <Link href={link.href} className="text-[13px]" style={CREAM_78}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="eyebrow text-gold mb-4">Contact</div>
          <ul className="list-none p-0 m-0 grid gap-[10px] text-[13px]">
            <li>
              <a href={`mailto:${contactEmail}`} style={CREAM_78}>
                {contactEmail}
              </a>
            </li>
            <li>ISSN pending</li>
          </ul>
        </div>
      </div>

      <div
        className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[18px] flex justify-between gap-5 flex-wrap text-[11.5px]"
        style={{ borderTop: '1px solid rgba(247,244,239,.18)' }}
      >
        <span>© 2026 International Collegiate Research Review</span>
        <span>Publication ethics · Open access policy · Articles licensed CC BY 4.0</span>
      </div>
    </footer>
  )
}
