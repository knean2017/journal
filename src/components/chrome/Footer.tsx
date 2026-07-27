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
    <footer className="mt-[clamp(52px,9vw,88px)] bg-maroon" style={CREAM_78}>
      <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[clamp(38px,5vw,54px)] grid gap-[clamp(28px,4vw,44px)] [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {/*
         * The stacked lockup drawn for dark grounds: mark and wordmark in one
         * transparent file, so it needs no cream plate behind it. It carries
         * the journal's name itself, which is why no wordmark text sits beside
         * it. The file is cropped to its artwork; padding here is layout's job.
         */}
        <div className="flex items-start">
          <Image
            src="/brand/lockup-stacked-white.png"
            alt="International Collegiate Research Review"
            width={956}
            height={686}
            className="w-[clamp(132px,17vw,168px)] h-auto"
          />
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
