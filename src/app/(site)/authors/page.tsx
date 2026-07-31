import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { AuthorsBrowser } from '@/components/site/authors/AuthorsBrowser'
import { PageHead } from '@/components/ui/PageHead'
import { PreviewBanner } from '@/components/ui/PreviewBanner'
import { buildAuthorCards } from '@/lib/authors/filter'
import { getArticles, getAuthors, getConfig, getDisciplines } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Contributors',
  description:
    'Everyone the International Collegiate Research Review has published, searchable by section, subject interest and institution.',
  path: '/authors',
})

export default async function AuthorsPage() {
  const [config, authors, articles, disciplines] = await Promise.all([
    getConfig(),
    getAuthors(),
    getArticles(),
    getDisciplines(),
  ])

  const cards = buildAuthorCards(authors, articles)

  return (
    <>
      <PageHead
        eyebrow="Authors"
        title="Contributor directory"
        lead="Every published author gets a permanent profile listing their affiliation, research interests, and work published with ICRR."
        maxWidth="none"
      />

      {config.showPreviewNotes ? (
        <PreviewBanner>
          The profiles below are placeholders showing how contributor pages will work. Real profiles
          appear as authors are published in Issue 1.
        </PreviewBanner>
      ) : null}

      <Suspense fallback={null}>
        <AuthorsBrowser cards={cards} disciplineNames={disciplines.map((d) => d.name)} />
      </Suspense>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-14">
        <div className="bg-cream border border-rule px-[clamp(20px,3.4vw,38px)] py-[clamp(22px,3.4vw,34px)] flex gap-[34px] items-center flex-wrap justify-between">
          <div className="max-w-[60ch]">
            <h2 className="m-0 font-serif text-[24px] font-bold text-maroon">
              Publish with us and get a profile
            </h2>
            <p className="mt-[10px] mb-0 text-[15px] leading-[1.8] text-body">
              Accepted authors receive a citable article of record and a permanent, ORCID-linked
              profile they can point to in applications.
            </p>
          </div>
          <Link href="/submit" className="btn-base btn-maroon px-7 py-[14px] text-[12px] flex-none">
            Submit a manuscript
          </Link>
        </div>
      </section>
    </>
  )
}
