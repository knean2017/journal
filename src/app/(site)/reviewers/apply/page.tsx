import type { Metadata } from 'next'
import { ReviewerForm } from '@/components/site/reviewers/ReviewerForm'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getDisciplines } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Join the reviewer panel',
  description:
    'Apply to review for the International Collegiate Research Review. Two manuscripts a month, three-week turnaround, across all five sections.',
  path: '/reviewers/apply',
})

const COMMITMENT = [
  { key: 'Volume', value: 'Up to two manuscripts a month, and you may decline any of them.' },
  { key: 'Turnaround', value: 'Three weeks from assignment to written report.' },
  { key: 'Format', value: 'You read the manuscript and return your view of it in writing.' },
  { key: 'Credit', value: 'Reviewers are named on the team page unless they ask not to be.' },
]

export default async function ReviewerApplyPage() {
  const [config, disciplines] = await Promise.all([getConfig(), getDisciplines()])

  return (
    <>
      <PageHead
        eyebrow="For reviewers"
        title="Join the reviewer panel"
        lead="We are recruiting reviewers across all five sections: graduate students, postdocs, and faculty. First-time reviewers are welcome and are paired with a section editor."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,56px)] items-start">
        <div>
          <h2 className="m-0 font-serif text-[24px] font-bold text-maroon">Who we are looking for</h2>
          <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
            Anyone who can read a manuscript in their field closely and write a fair, specific
            report. That means graduate students and postdocs as much as faculty. What matters is
            subject knowledge and a willingness to explain your reasoning to an author who is early
            in their career.
          </p>

          <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
            What the commitment is
          </h2>
          <div className="mt-4 border-t border-rule">
            {COMMITMENT.map((row) => (
              /* Key over value on a phone, beside it from 640px up. */
              <div
                key={row.key}
                className="grid gap-[2px] sm:[grid-template-columns:minmax(110px,170px)_minmax(0,1fr)] sm:gap-[clamp(14px,2vw,24px)] py-[14px] border-b border-rule text-[14.5px] leading-[1.7]"
              >
                <span className="font-bold text-ink">{row.key}</span>
                <span className="text-body">{row.value}</span>
              </div>
            ))}
          </div>

          <h2 id="form" className="mt-11 mb-0 font-serif text-[24px] font-bold text-maroon">
            Application
          </h2>
          <ReviewerForm disciplines={disciplines} />
        </div>

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <div className="border border-rule">
            <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
              How we assign work
            </div>
            <div className="px-[18px] py-4 text-[14px] leading-[1.8] text-body">
              A section editor matches each manuscript to a reviewer by subject, then sends the file
              with a deadline. You may decline any assignment without giving a reason.
            </div>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Conflicts of interest
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Tell us if you recognise the work, the institution, or the likely author. We reassign
              it. This is expected, not a failure.
            </p>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Questions
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Write to <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a> and an
              editor will reply within five working days.
            </p>
          </div>
        </aside>
      </section>
    </>
  )
}
