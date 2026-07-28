import Link from 'next/link'
import { PageHead } from '@/components/ui/PageHead'

const ROUTES = [
  { href: '/issue/current', label: 'Current issue', hint: 'What is being prepared now' },
  { href: '/archives', label: 'Archives', hint: 'Every issue, current and past' },
  { href: '/authors', label: 'Contributors', hint: 'Search the people we have published' },
  { href: '/submit', label: 'Submit', hint: 'Send us a manuscript' },
  { href: '/about', label: 'About', hint: 'What the journal publishes, and how' },
  { href: '/contact', label: 'Contact', hint: 'Write to the editorial office' },
]

/**
 * Shown for an address that does not exist, and for an article or contributor
 * that does not. A moved page is the likeliest reason somebody lands here, so
 * this offers the way onward rather than only stating the problem.
 */
export function NotFoundBody() {
  return (
    <>
      <PageHead
        eyebrow="404"
        title="That page is not here"
        lead="The address may be mistyped, or it may be an article that has not been published yet. Nothing is broken on your side."
        maxWidth="20ch"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9 pb-4">
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[18px]">
          {ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="border border-rule bg-page p-5 text-ink hover:border-gold hover:bg-cream-tint hover:text-ink"
            >
              <span className="block font-serif text-[19px] font-bold text-maroon">
                {route.label}
              </span>
              <span className="block mt-[6px] text-[13.5px] leading-[1.7] text-body-muted">
                {route.hint}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
