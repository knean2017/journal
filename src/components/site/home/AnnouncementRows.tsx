import Link from 'next/link'
import type { Announcement } from '@/lib/content'

export function AnnouncementRows({ announcements }: { announcements: Announcement[] }) {
  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[70px]">
      <div className="flex items-baseline justify-between gap-5 flex-wrap rule-double-bottom pb-3">
        <h2 className="m-0 font-serif text-[clamp(22px,3.4vw,30px)] font-normal">Announcements</h2>
        <Link href="/news" className="text-[11.5px] tracking-[0.16em] uppercase font-bold">
          All news
        </Link>
      </div>

      {announcements.map((announcement) => (
        /*
         * Date over title on a phone, beside it from 640px up. Held in three
         * columns the title had a third of the screen and broke a five-word
         * headline across four lines.
         */
        <Link
          key={announcement.slug}
          href="/news"
          className="grid gap-[10px] sm:[grid-template-columns:minmax(84px,150px)_minmax(0,1fr)_auto] sm:gap-[clamp(14px,2vw,26px)] items-baseline py-6 border-b border-rule text-ink hover:bg-cream hover:text-ink"
        >
          <span className="text-[11.5px] tracking-[0.14em] uppercase text-gold-muted font-bold">
            {announcement.publishedOn}
          </span>
          <span>
            <span className="block font-serif text-[19px] leading-[1.45]">
              {announcement.title}
            </span>
            <span className="block mt-[6px] text-[14px] leading-[1.7] text-body-muted">
              {announcement.blurb}
            </span>
          </span>
          {/* The whole row is the link on a phone; the arrow is desktop chrome. */}
          <span className="hidden sm:block text-maroon text-[18px]">→</span>
        </Link>
      ))}
    </section>
  )
}
