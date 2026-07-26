import type { TimelineEntry } from '@/lib/content'

export function ProductionTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="mt-5">
      {entries.map((entry) => (
        <div key={entry.title} className="grid [grid-template-columns:26px_1fr] gap-5 pb-[26px]">
          <div className="flex flex-col items-center gap-[6px]">
            {/* Round by design, per the prototype's circle rail. */}
            <span
              className="w-[11px] h-[11px] border border-maroon mt-[5px]"
              style={{
                borderRadius: '50%',
                background: entry.filled ? '#C0A265' : '#FDFBF7',
              }}
            />
            <span className="flex-1 w-px bg-rule" />
          </div>
          <div>
            <div className="flex gap-3 items-baseline flex-wrap">
              <h3 className="m-0 font-serif text-[18px] font-bold">{entry.title}</h3>
              <span className="text-[11.5px] tracking-[0.14em] uppercase text-gold-muted font-bold">
                {entry.when}
              </span>
            </div>
            <p className="mt-[7px] mb-0 text-[14.5px] leading-[1.75] text-body-muted">
              {entry.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
