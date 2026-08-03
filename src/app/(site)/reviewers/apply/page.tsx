import type { Metadata } from 'next'
import { ReviewerForm } from '@/components/site/reviewers/ReviewerForm'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getDisciplines } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Join the reviewer panel',
  description:
    'Apply to review for the International Collegiate Research Review. A remote volunteer position open worldwide to students, researchers, and professionals, reviewed on a rolling basis.',
  path: '/reviewers/apply',
})

const RESPONSIBILITIES = [
  'Review assigned manuscripts within your field.',
  'Evaluate the quality, originality, and clarity of submissions.',
  'Write fair, constructive, and evidence-based review reports.',
  'Complete reviews within the agreed timeline.',
  'Declare any conflicts of interest before reviewing.',
]

const LOOKING_FOR = [
  'Undergraduate or graduate student in a relevant discipline.',
  'Postdocs, faculty, and working professionals in the field are equally welcome.',
  'Strong analytical and critical thinking skills.',
  'Ability to provide objective and respectful feedback.',
  'Good written English.',
  'Previous reviewing experience is welcome but not required.',
]

const COMMITMENT = [
  {
    key: 'Position',
    value: 'Remote and voluntary. Open worldwide, and you need not be enrolled in a degree.',
  },
  { key: 'Volume', value: 'Up to two manuscripts a month, and you may decline any of them.' },
  { key: 'Turnaround', value: 'Three weeks from assignment to written report.' },
  { key: 'Credit', value: 'Reviewers are named on the team page unless they ask not to be.' },
  { key: 'Applications', value: 'Reviewed on a rolling basis.' },
  { key: 'Certificate', value: 'Issued to members who complete their term.' },
  {
    key: 'Reference',
    value: 'A personalised recommendation letter may follow, based on your contribution.',
  },
]

export default async function ReviewerApplyPage() {
  const [config, disciplines] = await Promise.all([getConfig(), getDisciplines()])

  return (
    <>
      <PageHead
        eyebrow="For reviewers"
        title="Join the reviewer panel"
        lead="We are recruiting reviewers across all six sections. This is a remote volunteer position, open worldwide to students, researchers, and professionals in the field. First-time reviewers are welcome and are paired with a section editor."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 page-split">
        <div>
          <h2 className="m-0 font-serif text-[24px] font-bold text-maroon">About the role</h2>
          <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
            Reviewers evaluate manuscripts in their area of expertise and provide objective,
            constructive feedback to support editorial decisions.
          </p>

          <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
            Responsibilities
          </h2>
          <ul className="mt-4 mb-0 p-0 list-none border-t border-rule">
            {RESPONSIBILITIES.map((item) => (
              <li
                key={item}
                className="py-[13px] border-b border-rule text-[14.5px] leading-[1.7] text-body"
              >
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
            Who we are looking for
          </h2>
          <ul className="mt-4 mb-0 p-0 list-none border-t border-rule">
            {LOOKING_FOR.map((item) => (
              <li
                key={item}
                className="py-[13px] border-b border-rule text-[14.5px] leading-[1.7] text-body"
              >
                {item}
              </li>
            ))}
          </ul>

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

        <aside className="flex flex-col gap-5 page-aside">
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
