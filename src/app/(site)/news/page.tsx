import Link from 'next/link'
import { StayInformed } from '@/components/site/news/StayInformed'
import { PageHead } from '@/components/ui/PageHead'
import { getAnnouncements } from '@/lib/content'

export default async function NewsPage() {
  const announcements = await getAnnouncements()

  return (
    <>
      <PageHead eyebrow="Announcements" title="News from the editorial office" maxWidth="none" />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,56px)] items-start">
        <div>
          {announcements.map((announcement) => (
            <article key={announcement.slug} className="py-7 border-b border-rule">
              <div className="flex gap-[14px] items-center flex-wrap">
                <span className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
                  {announcement.publishedOn}
                </span>
                <span className="text-[11px] tracking-[0.16em] uppercase text-gold font-bold">
                  {announcement.tag}
                </span>
              </div>
              <h2 className="mt-[10px] mb-0 font-serif text-[clamp(21px,3vw,26px)] leading-[1.35] font-normal">
                {announcement.title}
              </h2>
              <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
                {announcement.body}
              </p>
              {announcement.ctaLabel && announcement.ctaHref ? (
                <Link
                  href={announcement.ctaHref}
                  className="inline-block mt-[14px] text-[11.5px] tracking-[0.14em] uppercase font-bold border-b border-gold pb-[3px]"
                >
                  {announcement.ctaLabel}
                </Link>
              ) : null}
            </article>
          ))}
        </div>

        <StayInformed />
      </section>
    </>
  )
}
