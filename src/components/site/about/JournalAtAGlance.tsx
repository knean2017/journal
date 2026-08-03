import type { Fact } from '@/lib/content'

export function JournalAtAGlance({ facts }: { facts: Fact[] }) {
  // Entered in the panel, so it can be empty. The header bar goes with it.
  if (facts.length === 0) return null

  return (
    <div className="border border-rule bg-cream">
      <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
        Journal at a glance
      </div>
      <div className="px-[18px] pt-[6px] pb-[14px]">
        {facts.map((fact) => (
          <div
            key={fact.key}
            className="flex justify-between gap-4 py-[11px] border-b border-rule text-[13.5px]"
          >
            <span className="text-body-muted">{fact.key}</span>
            <span className="font-bold text-right">{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
