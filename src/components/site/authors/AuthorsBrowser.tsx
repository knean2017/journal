'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { countLabel, filterAuthors, publicationLabel } from '@/lib/authors/filter'
import type { AuthorCard } from '@/lib/authors/filter'

const ALL = 'All'

export function AuthorsBrowser({
  cards,
  disciplineNames,
}: {
  cards: AuthorCard[]
  disciplineNames: string[]
}) {
  const router = useRouter()
  const params = useSearchParams()

  const filter = params.get('filter') ?? ALL
  const query = params.get('q') ?? ''

  // Filter and query live in the URL so results are shareable and survive reload.
  const setParams = useCallback(
    (next: { filter?: string; q?: string }) => {
      const updated = new URLSearchParams(params.toString())
      const nextFilter = next.filter ?? filter
      const nextQuery = next.q ?? query

      if (nextFilter === ALL) updated.delete('filter')
      else updated.set('filter', nextFilter)

      if (!nextQuery) updated.delete('q')
      else updated.set('q', nextQuery)

      const search = updated.toString()
      router.replace(search ? `/authors?${search}` : '/authors', { scroll: false })
    },
    [params, filter, query, router],
  )

  const visible = filterAuthors(cards, filter, query)
  const chips = [ALL, ...disciplineNames]

  return (
    <>
      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-7">
        <div className="flex gap-4 items-center flex-wrap justify-between border-b border-rule pb-[18px]">
          <div className="flex gap-2 flex-wrap">
            {chips.map((chip) => {
              const active = chip === filter
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setParams({ filter: chip })}
                  className="px-[15px] py-2 text-[11.5px] tracking-[0.1em] uppercase font-bold border cursor-pointer"
                  style={{
                    borderColor: active ? '#5D1D21' : '#E2DACB',
                    background: active ? '#5D1D21' : '#FDFBF7',
                    color: active ? '#F7F4EF' : '#5A524A',
                  }}
                >
                  {chip === ALL ? 'All sections' : chip}
                </button>
              )
            })}
          </div>

          <input
            type="search"
            aria-label="Search contributors"
            value={query}
            onChange={(event) => setParams({ q: event.target.value })}
            placeholder="Search name, institution, or topic"
            className="field w-[min(100%,290px)] px-[14px] py-[10px] text-[14px]"
          />
        </div>

        <div className="pt-4 text-[12px] tracking-[0.14em] uppercase text-gold-muted font-bold">
          {countLabel(visible.length, cards.length)}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-[14px]">
        {visible.length > 0 ? (
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,296px),1fr))] gap-[22px]">
            {visible.map((card) => (
              <Link
                key={card.slug}
                href={`/authors/${card.slug}`}
                className="grid [grid-template-columns:96px_1fr] gap-[18px] border border-rule bg-page p-5 text-ink items-start hover:border-gold hover:bg-cream-tint hover:text-ink"
              >
                <div className="w-24 h-[120px] border border-rule bg-cream">
                  <ImageSlot
                    src={card.portraitPath}
                    label="Photo"
                    ratio="96/120"
                    className="h-full w-full border-0"
                  />
                </div>
                <div>
                  <div className="text-[10.5px] tracking-[0.16em] uppercase text-gold-muted font-bold">
                    {card.disciplineName}
                  </div>
                  <h3 className="mt-[6px] mb-0 font-serif text-[19px] leading-[1.35] font-bold">
                    {card.name}
                  </h3>
                  <div className="mt-1 text-[13.5px] leading-[1.6] text-body-muted">
                    {card.role}
                  </div>
                  <div className="mt-[2px] text-[13.5px] leading-[1.6] text-body-muted">
                    {card.affiliation}
                  </div>
                  <div className="mt-3 text-[11.5px] tracking-[0.1em] uppercase text-maroon font-bold">
                    {publicationLabel(card.publicationCount)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-rule px-6 py-14 text-center text-body-muted">
            <div className="font-serif text-[20px] text-ink">No contributors match that search</div>
            <p className="mt-2 mb-0 text-[14px]">Try a different name, institution, or section.</p>
            <Link
              href="/authors"
              className="inline-block mt-4 text-[11.5px] tracking-[0.14em] uppercase font-bold border-b border-gold pb-[3px]"
            >
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </>
  )
}
