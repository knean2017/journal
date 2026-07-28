import type { Metadata } from 'next'
import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getIssues } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Archives',
  description:
    'Every issue of the International Collegiate Research Review, current and scheduled, with its table of contents.',
  alternates: { canonical: '/archives' },
}

export default async function ArchivesPage() {
  const [config, issues] = await Promise.all([getConfig(), getIssues()])
  const current = issues.find((issue) => issue.isCurrent)
  const scheduled = issues.filter((issue) => !issue.isCurrent)

  return (
    <>
      <PageHead
        eyebrow="Archives"
        title="All volumes and issues"
        lead="Every issue remains permanently available and free to read. Nothing is paywalled or withdrawn."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10">
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-6">
          {current ? (
            <div className="callout-gold p-6">
              <div className="h-[150px] border border-rule bg-page mb-[18px]">
                <ImageSlot
                  src={current.coverPath}
                  label="Cover"
                  ratio="3/4"
                  sizes="120px"
                  className="h-full w-full border-0"
                />
              </div>
              <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
                {current.statusLabel}
              </div>
              <h3 className="mt-2 mb-0 font-serif text-[20px] font-bold">
                Volume {current.volume}, Issue {current.number}
              </h3>
              <p className="mt-2 mb-0 text-[13.5px] leading-[1.7] text-body-muted">
                Publishing {config.expected}. Submissions open until {config.deadline}.
              </p>
              <Link
                href="/issue/current"
                className="inline-block mt-[14px] text-[11.5px] tracking-[0.14em] uppercase font-bold border-b border-gold pb-[3px]"
              >
                Issue status
              </Link>
            </div>
          ) : null}

          {scheduled.map((issue) => (
            <div
              key={issue.slug}
              className="border border-dashed border-rule p-6 flex flex-col justify-center min-h-[300px] text-center text-gold-muted"
            >
              <div className="font-serif text-[19px] text-body-muted">
                Volume {issue.volume}, Issue {issue.number}
              </div>
              <p className="mt-2 mb-0 text-[13.5px] leading-[1.7]">{issue.description}</p>
            </div>
          ))}

          <div className="border border-dashed border-rule p-6 flex flex-col justify-center min-h-[300px] text-center text-gold-muted">
            <div className="font-serif text-[19px] text-body-muted">Future issues</div>
            <p className="mt-2 mb-0 text-[13.5px] leading-[1.7]">
              Published at the end of each month
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-rule pt-[26px] text-[14.5px] leading-[1.8] text-body-muted max-w-[74ch]">
          <strong className="text-ink">Indexing and preservation.</strong> Once the first issue is
          published we will register an ISSN and deposit metadata with relevant indexes, so articles
          stay citable independently of this website.
        </div>
      </section>
    </>
  )
}
