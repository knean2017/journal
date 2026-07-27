import { ImageSlot } from '@/components/ui/ImageSlot'

export function HeroBand({ imagePath }: { imagePath: string | null }) {
  return (
    <section
      className="max-w-[1400px] mx-auto px-[clamp(14px,4vw,40px)] pt-[34px]"
      style={{ animation: 'icrrPlate .9s cubic-bezier(.2,.7,.2,1) .3s both' }}
    >
      {/*
       * Taller than the prototype's 230px floor on a phone. The caption sits
       * over the bottom of the band, and at 230px it landed on top of the
       * placeholder's centred label while this slot is still waiting for a
       * photograph.
       */}
      <div className="relative h-[clamp(288px,45vw,470px)] bg-cream border border-rule">
        <ImageSlot
          src={imagePath}
          label="A library, reading room, or campus interior"
          ratio="1400/470"
          priority
          className="absolute inset-0 h-full w-full"
        />

        <div
          className="absolute left-0 bottom-0 w-full h-[52%] pointer-events-none"
          style={{
            background: 'linear-gradient(to top,rgba(36,31,30,.72),rgba(36,31,30,0))',
          }}
        />

        <div className="absolute left-[clamp(16px,3vw,34px)] right-[clamp(16px,3vw,34px)] bottom-[clamp(16px,2.4vw,28px)] pointer-events-none flex items-end justify-between gap-6 flex-wrap">
          <div className="font-serif text-[clamp(16px,2.4vw,22px)] leading-[1.5] text-cream max-w-[34ch]">
            Rigorous review. Transparent process. Work that stands on its own.
          </div>
          <div
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(247,244,239,.75)' }}
          >
            Volume 1 in preparation
          </div>
        </div>
      </div>
    </section>
  )
}
