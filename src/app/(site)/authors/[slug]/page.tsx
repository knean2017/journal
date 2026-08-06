import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { ToastButton } from '@/components/ui/ToastButton'
import { getArticlesByAuthor, getAuthorBySlug, getAuthors } from '@/lib/content'
import { SITE_SHORT_NAME, absolute } from '@/lib/site'
import { PDF_TOAST } from '@/lib/toasts'

export async function generateStaticParams() {
  const authors = await getAuthors()
  return authors.map((author) => ({ slug: author.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Contributor not found' }

  const description = `${author.role} at ${author.affiliation}. Work published in the ${author.disciplineName} section of the International Collegiate Research Review.`

  return {
    title: author.name,
    description,
    alternates: { canonical: `/authors/${author.slug}` },
    openGraph: {
      type: 'profile',
      title: author.name,
      description,
      url: absolute(`/authors/${author.slug}`),
      siteName: SITE_SHORT_NAME,
    },
    twitter: { card: 'summary_large_image', title: author.name, description },
  }
}

const CHIP =
  'px-[18px] py-[10px] border border-rule text-[11.5px] tracking-[0.12em] uppercase font-bold text-maroon hover:border-gold'

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const publications = await getArticlesByAuthor(author.id)

  /*
   * ORCID as `sameAs` is the part that earns its place: it is the identifier
   * the rest of scholarly indexing joins on, so it ties this page to the
   * person's record everywhere else rather than to a name that other people
   * also have.
   */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absolute(`/authors/${author.slug}`),
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    knowsAbout: author.interests,
    affiliation: { '@type': 'Organization', name: author.affiliation },
    ...(author.orcid ? { sameAs: [`https://orcid.org/${author.orcid}`] } : {}),
  }

  return (
    <>
      <JsonLd data={schema} />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[34px]">
        <Link href="/authors" className="text-[11.5px] tracking-[0.14em] uppercase font-bold">
          ← All contributors
        </Link>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[26px]">
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[clamp(24px,4vw,44px)] items-start rule-double-bottom pb-9">
          <div className="w-full max-w-[200px] border border-rule bg-cream">
            <ImageSlot
              src={author.portraitPath}
              label="Author photograph"
              ratio="4/5"
              sizes="200px"
              className="h-full w-full border-0"
            />
          </div>
          <div>
            <div className="text-[11.5px] tracking-[0.18em] uppercase text-gold-muted font-bold">
              {author.disciplineName}
            </div>
            <h1 className="mt-[10px] mb-0 font-serif text-[clamp(26px,5vw,40px)] leading-[1.2] font-normal">
              {author.name}
            </h1>
            <p className="mt-[10px] mb-0 text-[16px] leading-[1.7] text-body">
              {author.role} · {author.affiliation}
            </p>
            <p className="mt-[2px] mb-0 text-[15px] leading-[1.7] text-body-muted">
              {author.location}
            </p>
            <div className="flex gap-[10px] flex-wrap mt-[22px]">
              {author.orcid ? (
                <ToastButton message={PDF_TOAST} className={CHIP}>
                  ORCID {author.orcid}
                </ToastButton>
              ) : null}
              <ToastButton message={PDF_TOAST} className={CHIP}>
                Email author
              </ToastButton>
              <ToastButton message={PDF_TOAST} className={CHIP}>
                Download all PDFs
              </ToastButton>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 page-split">
        <div>
          <h2 className="m-0 font-serif text-[22px] font-bold text-maroon">Biography</h2>
          <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">{author.bio}</p>

          <h2 className="mt-[38px] mb-0 font-serif text-[22px] font-bold text-maroon">
            Publications with ICRR
          </h2>

          {publications.length > 0 ? (
            <div className="mt-4 border-t border-rule">
              {publications.map((publication) => (
                <div key={publication.slug} className="py-[22px] border-b border-rule">
                  <div className="flex gap-3 items-center flex-wrap">
                    <span className="text-[10.5px] tracking-[0.14em] uppercase text-gold-muted font-bold">
                      {publication.disciplineName}
                    </span>
                    <span className="text-[10.5px] tracking-[0.14em] uppercase text-gold font-bold">
                      {publication.statusLabel}
                    </span>
                  </div>
                  <Link
                    href={`/articles/${publication.slug}`}
                    className="block mt-2 font-serif text-[20px] leading-[1.45] text-ink"
                  >
                    {publication.title}
                  </Link>
                  <p className="mt-2 mb-0 text-[14px] leading-[1.75] text-body-muted">
                    {publication.abstract}
                  </p>
                  <div className="flex gap-[14px] items-center mt-3 text-[12px] text-gold-muted">
                    <span>{publication.citation}</span>
                    <ToastButton
                      message={PDF_TOAST}
                      className="tracking-[0.12em] uppercase font-bold text-maroon"
                    >
                      PDF
                    </ToastButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-rule p-[34px] text-center text-body-muted text-[14.5px]">
              No published articles yet. This author has work under review for Issue 1.
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-5 page-aside">
          <div className="border border-rule bg-cream">
            <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
              Research interests
            </div>
            <div className="px-[18px] py-4 flex flex-wrap gap-2">
              {author.interests.map((interest) => (
                <span
                  key={interest}
                  className="border border-rule bg-page px-3 py-[6px] text-[12.5px] text-body"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Affiliation
            </div>
            <p className="mt-[10px] mb-0 text-[14px] leading-[1.75] text-body">
              {author.affiliation}
              <br />
              {author.department}
              <br />
              {author.location}
            </p>
          </div>
        </aside>
      </section>
    </>
  )
}
