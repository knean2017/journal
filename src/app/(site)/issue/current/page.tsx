import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductionTimeline } from '@/components/site/issue/ProductionTimeline'
import { TocPreview } from '@/components/site/issue/TocPreview'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getCurrentIssue, getTimeline, getTocPreview } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Current issue',
  description:
    'The issue in preparation at the International Collegiate Research Review, its table of contents, and where it has reached in production.',
  alternates: { canonical: '/issue/current' },
}

const TEMPLATE_SLUG = 'canopy-cover-and-summer-surface-temperature'

export default async function CurrentIssuePage() {
  const [config, issue, timeline, tocPreview] = await Promise.all([
    getConfig(),
    getCurrentIssue(),
    getTimeline(),
    getTocPreview(),
  ])

  return (
    <>
      <PageHead
        eyebrow="Current issue"
        title={issue ? `Volume ${issue.volume}, Issue ${issue.number}` : 'Current issue'}
        lead={`Inaugural issue · Publishing ${config.expected}, then at the end of each month`}
        centered
        maxWidth="none"
        rule="double-hairline"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-11 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,56px)] items-start">
        <div>
          <div className="callout-gold px-7 py-[26px]">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gold-muted font-bold">
              Status
            </div>
            <h2 className="mt-2 mb-0 font-serif text-[23px] font-bold text-maroon">
              Calls for papers are open
            </h2>
            <p className="mt-[10px] mb-0 text-[15px] leading-[1.8] text-body">
              No articles have been published yet. The full table of contents, with abstracts and
              PDFs, appears here when Issue 1 publishes on {config.expected}.
            </p>
          </div>

          <h2 className="mt-11 mb-0 font-serif text-[24px] font-bold">Production timeline</h2>
          <ProductionTimeline entries={timeline} />

          <h2 className="mt-6 mb-0 font-serif text-[24px] font-bold">
            How the table of contents will appear
          </h2>
          <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.8] text-body-muted">
            A preview of the listing, shown with placeholder entries.
          </p>
          <TocPreview entries={tocPreview} templateSlug={TEMPLATE_SLUG} />

          <Link
            href={`/articles/${TEMPLATE_SLUG}`}
            className="inline-block mt-[22px] text-[11.5px] tracking-[0.16em] uppercase font-bold border-b border-gold pb-[3px]"
          >
            View the article page template
          </Link>
        </div>

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <div className="border border-rule bg-cream px-5 py-[22px] text-center">
            <div className="h-[190px] border border-rule bg-page mb-4">
              <ImageSlot
                src={issue?.coverPath ?? null}
                label="Issue cover"
                ratio="3/4"
                sizes="150px"
                className="h-full w-full border-0"
              />
            </div>
            <div className="font-serif text-[17px] font-bold">Issue 1 cover</div>
            <p className="mt-[6px] mb-0 text-[13px] leading-[1.7] text-body-muted">
              Cover art to be commissioned.
            </p>
          </div>

          <div className="border border-rule">
            <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
              Key dates
            </div>
            <div className="px-[18px] pt-[6px] pb-[14px]">
              {[
                { key: 'Submissions close', value: config.deadline, last: false },
                { key: 'Decisions', value: 'Mid-Sept 2026', last: false },
                { key: 'Publication', value: config.expected, last: true },
              ].map((row) => (
                <div
                  key={row.key}
                  className={`flex justify-between gap-[14px] py-[11px] text-[13.5px] ${row.last ? '' : 'border-b border-rule'}`}
                >
                  <span className="text-body-muted">{row.key}</span>
                  <span className="font-bold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/submit" className="btn-base btn-maroon block text-center py-[14px]">
            Submit to this issue
          </Link>
        </aside>
      </section>
    </>
  )
}
