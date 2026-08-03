import type { Metadata } from 'next'
import { SubmissionForm } from '@/components/site/submit/SubmissionForm'
import { TemplatesDialog } from '@/components/site/submit/TemplatesDialog'
import { PageHead } from '@/components/ui/PageHead'
import {
  getChecklist,
  getConfig,
  getDisciplines,
  getProcessSteps,
  getRequirements,
} from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Submit a manuscript',
  description:
    'Author guidelines, the manuscript checklist, and the submission form. No submission charge and no processing charge.',
  path: '/submit',
})

export default async function SubmitPage() {
  const [config, disciplines, requirements, checklist, steps] = await Promise.all([
    getConfig(),
    getDisciplines(),
    getRequirements(),
    getChecklist(),
    getProcessSteps(),
  ])

  return (
    <>
      <PageHead
        eyebrow="For authors"
        title="Submit a manuscript"
        lead={`Submissions for Volume 1, Issue 1 close ${config.deadline}. There are no fees at any stage.`}
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 page-split">
        <div>
          <h2 className="m-0 font-serif text-[24px] font-bold text-maroon">Eligibility</h2>
          <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
            At least one author must be a current undergraduate or graduate student, or have
            graduated within the last twelve months. Faculty may appear as co-authors where they
            contributed substantively.
          </p>

          {/* Each list below is entered in the panel, so its heading goes with it. */}
          {requirements.length > 0 ? (
            <>
              <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
                Manuscript requirements
              </h2>
              <div className="mt-4 border-t border-rule">
                {requirements.map((requirement) => (
              /*
               * The key sits over its value on a phone. Side by side it took
               * 170px of a 375px screen to say "Length", leaving 152px for the
               * requirement itself.
               */
                  <div
                    key={requirement.key}
                    className="grid gap-[2px] sm:[grid-template-columns:minmax(110px,170px)_minmax(0,1fr)] sm:gap-[clamp(14px,2vw,24px)] py-[14px] border-b border-rule text-[14.5px] leading-[1.7]"
                  >
                    <span className="font-bold text-ink">{requirement.key}</span>
                    <span className="text-body">{requirement.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {checklist.length > 0 ? (
            <>
              <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
                Before you submit
              </h2>
              <div className="mt-[14px] flex flex-col gap-[10px]">
                {checklist.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 items-start text-[14.5px] leading-[1.75] text-body"
                  >
                    <span className="text-gold font-bold flex-none">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <h2 id="form" className="mt-11 mb-0 font-serif text-[24px] font-bold text-maroon">
            Submission form
          </h2>
          <SubmissionForm disciplines={disciplines} />
        </div>

        <aside className="flex flex-col gap-5 page-aside">
          {steps.length > 0 ? (
            <div className="border border-rule">
              <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
                What happens next
              </div>
              <div className="px-[18px] py-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="grid [grid-template-columns:24px_1fr] gap-3 py-[9px]"
                  >
                    <span className="font-serif text-[12px] text-gold pt-[2px]">{step.number}</span>
                    <span>
                      <span className="block text-[14px] font-bold">{step.title}</span>
                      <span className="block text-[12.5px] text-body-muted mt-[2px]">
                        {step.time}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Templates
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Optional. Your own format is welcome. These are here if you would rather start from a
              document already laid out to the requirements above.
            </p>
            <TemplatesDialog className="inline-block mt-3 text-[11.5px] tracking-[0.12em] uppercase font-bold border-b border-gold pb-[3px] text-maroon">
              Download templates
            </TemplatesDialog>
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
