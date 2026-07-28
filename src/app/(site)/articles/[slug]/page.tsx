import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleBody } from '@/components/site/article/ArticleBody'
import { PreviewBanner } from '@/components/ui/PreviewBanner'
import { ToastButton } from '@/components/ui/ToastButton'
import { getArticleBySlug, getArticles, getConfig, getIssues } from '@/lib/content'
import { absolute } from '@/lib/site'
import { PDF_TOAST } from '@/lib/toasts'

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

/** A sentence or two of the abstract, cut on a word. */
function summarise(abstract: string, limit = 165): string {
  const clean = abstract.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  return `${clean.slice(0, clean.lastIndexOf(' ', limit))}…`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article not found' }

  const [config, issues] = await Promise.all([getConfig(), getIssues()])
  const issue = issues.find((candidate) => candidate.slug === article.issueSlug)
  const names = article.authors.map((author) => author.authorName)

  /*
   * Highwire Press tags. These are what Google Scholar reads, and an academic
   * journal that omits them does not appear there at all, however good its
   * ordinary metadata is. Every value is emitted only when it is actually
   * known: a guessed page number or a placeholder ISSN is worse than a missing
   * tag, because indexers keep what they first read.
   */
  const citation: Record<string, string | string[]> = {
    citation_title: article.title,
    citation_journal_title: 'International Collegiate Research Review',
  }
  if (names.length) citation.citation_author = names
  if (article.publishedOn) citation.citation_publication_date = article.publishedOn
  if (issue) {
    citation.citation_volume = String(issue.volume)
    citation.citation_issue = String(issue.number)
  }
  if (article.pageStart) citation.citation_firstpage = String(article.pageStart)
  if (article.pageEnd) citation.citation_lastpage = String(article.pageEnd)
  if (article.pdfPath) citation.citation_pdf_url = article.pdfPath
  if (config.issnStatus && !/pending/i.test(config.issnStatus)) {
    citation.citation_issn = config.issnStatus
  }

  const description = summarise(article.abstract)

  return {
    title: article.title,
    description,
    authors: names.map((name) => ({ name })),
    keywords: article.keywords,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: absolute(`/articles/${article.slug}`),
      publishedTime: article.publishedOn ?? undefined,
      authors: names,
      tags: article.keywords,
    },
    twitter: { card: 'summary_large_image', title: article.title, description },
    other: citation,
  }
}

const CONTENTS = [
  'Abstract',
  '1. Introduction',
  '2. Method',
  '3. Results',
  '4. Discussion',
  'References',
]

const OUTLINE_CHIP =
  'px-5 py-[11px] border border-rule text-maroon text-[11.5px] tracking-[0.12em] uppercase font-bold hover:border-gold'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article, config] = await Promise.all([getArticleBySlug(slug), getConfig()])
  if (!article) notFound()

  const dates = [
    { key: 'Received', value: article.receivedOn ?? 'TBA' },
    { key: 'Accepted', value: article.acceptedOn ?? 'TBA' },
    { key: 'Published', value: article.publishedOn ?? 'TBA' },
    { key: 'Licence', value: 'CC BY 4.0' },
  ]

  return (
    <>
      {config.showPreviewNotes ? (
        <PreviewBanner>
          This shows how a published article will read. No articles have been published yet.
        </PreviewBanner>
      ) : null}

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[30px]">
        <div className="max-w-[74ch]">
          <div className="flex gap-[14px] items-center flex-wrap">
            <span className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              {article.disciplineName}
            </span>
            <span className="text-[11px] tracking-[0.16em] uppercase text-gold font-bold">
              {article.articleType}
            </span>
          </div>

          <h1 className="mt-[14px] mb-0 font-serif text-[clamp(24px,4.6vw,38px)] leading-[1.28] font-normal">
            {article.title}
          </h1>

          <p className="mt-4 mb-0 text-[16px] leading-[1.7] text-body">
            {article.authors.map((author, i) => (
              <span key={author.authorId}>
                {i > 0 ? ', ' : ''}
                {author.authorName}
                <sup>{author.affiliationMarker}</sup>
              </span>
            ))}
          </p>
          <p className="mt-1 mb-0 text-[13.5px] leading-[1.7] text-gold-muted">
            {article.authors.map((author) => `${author.affiliationMarker} Institution, Department`).join(' · ')}
          </p>

          <div className="flex gap-[10px] flex-wrap mt-[22px] pt-[22px] border-t border-rule">
            <ToastButton
              message={PDF_TOAST}
              className="btn-base btn-maroon px-5 py-[11px] text-[11.5px] tracking-[0.12em]"
            >
              Download PDF
            </ToastButton>
            <ToastButton message={PDF_TOAST} className={OUTLINE_CHIP}>
              Cite
            </ToastButton>
            <ToastButton message={PDF_TOAST} className={OUTLINE_CHIP}>
              Share
            </ToastButton>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,60px)] items-start">
        <article className="max-w-[74ch] font-serif">
          <div className="bg-cream px-[26px] py-6" style={{ borderLeft: '3px solid #5D1D21' }}>
            <div className="font-sans text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Abstract
            </div>
            <p className="mt-[10px] mb-0 text-[15.5px] leading-[1.85] text-ink-soft">
              {article.abstract}
            </p>
            <div className="mt-4 font-sans text-[13px] text-body-muted">
              <strong className="text-ink">Keywords:</strong> {article.keywords.join(', ')}
            </div>
          </div>

          <ArticleBody />
        </article>

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <div className="border border-rule bg-cream px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Article information
            </div>
            <div className="mt-3">
              {dates.map((row, i) => (
                <div
                  key={row.key}
                  className={`flex justify-between gap-[14px] py-[9px] text-[13px] ${i === dates.length - 1 ? '' : 'border-b border-rule'}`}
                >
                  <span className="text-body-muted">{row.key}</span>
                  <span className="font-bold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              On this page
            </div>
            <div className="flex flex-col gap-[9px] mt-3 text-[13.5px]">
              {CONTENTS.map((item) => (
                <span key={item} className="text-maroon">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
