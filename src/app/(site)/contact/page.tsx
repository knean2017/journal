import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/site/contact/ContactForm'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Write to the editorial office of the International Collegiate Research Review, or find the right route for submissions and reviewing.',
}

export default async function ContactPage() {
  const config = await getConfig()

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Write to the editorial office"
        lead="One small team reads everything that arrives here. We answer within five working days."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,56px)] items-start">
        <ContactForm />

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Editorial office
            </div>
            <p className="mt-[10px] mb-0 text-[14px] leading-[1.75] text-body">
              <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
              <br />
              Open access · ISSN {config.issnStatus.toLowerCase()} · Established 2026
            </p>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Faster routes
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Sending us a manuscript? Use the{' '}
              <Link href="/submit" className="border-b border-gold pb-[1px]">
                submission form
              </Link>{' '}
              instead, so it reaches a section editor with the file attached.
            </p>
            <p className="mt-3 mb-0 text-[13.5px] leading-[1.75] text-body">
              Want to review for us? Apply to the{' '}
              <Link href="/reviewers/apply" className="border-b border-gold pb-[1px]">
                reviewer panel
              </Link>
              .
            </p>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              What we cannot do
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              We do not comment on a decision outside the formal process, and we cannot preview
              whether a manuscript is likely to be accepted.
            </p>
          </div>
        </aside>
      </section>
    </>
  )
}
