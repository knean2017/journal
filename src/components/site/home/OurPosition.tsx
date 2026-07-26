import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'

export function OurPosition({ imagePath }: { imagePath: string | null }) {
  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[70px]">
      <div className="bg-cream border border-rule px-[clamp(22px,4vw,60px)] py-[clamp(26px,4vw,52px)] grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[clamp(26px,4vw,52px)] items-center">
        <div>
          <div className="text-[11.5px] tracking-[0.22em] uppercase text-gold-muted font-bold">
            Our position
          </div>
          <blockquote className="mt-4 mb-0 font-serif text-[clamp(19px,2.6vw,26px)] leading-[1.55] italic text-maroon-deep">
            “Student research deserves the same editorial care as any other scholarship. Not a lower
            bar, just a fairer door.”
          </blockquote>
          <p className="mt-5 mb-0 text-[14.5px] leading-[1.8] text-body">
            ICRR exists because early-career researchers produce serious work that rarely finds a
            home. We review it properly, edit it carefully, and publish it where it can be cited.
          </p>
          <Link
            href="/about"
            className="inline-block mt-[22px] text-[11.5px] tracking-[0.16em] uppercase font-bold border-b border-gold pb-[3px]"
          >
            More about the journal
          </Link>
        </div>

        <div className="h-[290px] border border-rule bg-page">
          <ImageSlot
            src={imagePath}
            label="Editorial photo"
            ratio="400/290"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  )
}
