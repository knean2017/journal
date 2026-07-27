import Link from 'next/link'
import { JournalAtAGlance } from '@/components/site/about/JournalAtAGlance'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getFacts } from '@/lib/content'

const SECTIONS = [
  {
    heading: 'Aims and scope',
    body: 'We consider original research, systematic reviews, replication studies, and case analyses. Work is judged on its question, its method, and the honesty of its conclusions, not on the seniority of its author. Interdisciplinary submissions are welcome.',
  },
  {
    /*
     * This copy must not promise author feedback. The journal cannot guarantee
     * it. Nor may it name a review model: the journal reviews what it
     * publishes, but it does not run double-blind or formal peer review, and
     * saying either would promise a process that does not exist.
     */
    heading: 'Review policy',
    body: 'Every submission is reviewed before a decision is made, and nothing is published without that review. Editors recuse themselves from work involving their own institution, supervisor, or collaborators.',
  },
  {
    heading: 'Publication ethics',
    body: 'We follow COPE principles on authorship, plagiarism, data integrity, and corrections. Authors declare all funding, supervision, and use of generative tools; ethical approval is required for research involving human subjects.',
  },
  {
    heading: 'Open access and copyright',
    body: 'No submission charges and no processing charges. Authors retain copyright under CC BY 4.0, and every article is issued a persistent identifier and a PDF of record.',
  },
]

export default async function AboutPage() {
  const [config, facts] = await Promise.all([getConfig(), getFacts()])

  return (
    <>
      <PageHead eyebrow="About the journal" title="An independent journal for student scholarship" />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-11 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,64px)] items-start">
        <div>
          <p className="m-0 font-serif text-[20px] leading-[1.75] text-maroon-deep">
            The International Collegiate Research Review publishes reviewed research by
            undergraduate and graduate students, from any institution and any country, at no cost to
            authors or readers.
          </p>

          {SECTIONS.map((section, i) => (
            <div key={section.heading}>
              <h2
                className="mb-0 font-serif text-[24px] font-bold text-maroon"
                style={{ marginTop: i === 0 ? 44 : 40 }}
              >
                {section.heading}
              </h2>
              <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">{section.body}</p>
            </div>
          ))}
        </div>

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <JournalAtAGlance facts={facts} />

          <div id="contact" className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Editorial office
            </div>
            <p className="mt-[10px] mb-0 text-[14px] leading-[1.75] text-body">
              Enquiries and submissions
              <br />
              <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
            </p>
            <Link
              href="/contact"
              className="inline-block mt-3 text-[11.5px] tracking-[0.12em] uppercase font-bold border-b border-gold pb-[3px]"
            >
              Use the contact form
            </Link>
          </div>
        </aside>
      </section>
    </>
  )
}
