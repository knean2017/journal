import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { Discipline } from '@/lib/content'
import { balancedColumns } from '@/lib/layout'

export function WhatWePublish({ disciplines }: { disciplines: Discipline[] }) {
  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-16">
      <div className="flex items-baseline justify-between gap-5 flex-wrap rule-double-bottom pb-3">
        <h2 className="m-0 font-serif text-[clamp(22px,3.4vw,30px)] font-normal">
          What we publish
        </h2>
        <Link href="/about" className="text-[11.5px] tracking-[0.16em] uppercase font-bold">
          Aims &amp; scope
        </Link>
      </div>

      <div
        className="publish-grid"
        style={
          {
            '--publish-columns': balancedColumns(disciplines.length, 5),
            '--publish-columns-mid': balancedColumns(disciplines.length, 3),
          } as CSSProperties
        }
      >
        {disciplines.map((discipline) => (
          <div key={discipline.slug} className="py-[26px]">
            <div className="font-serif text-[19px] font-bold text-ink">{discipline.name}</div>
            <p className="mt-2 mb-0 text-[13.5px] leading-[1.75] text-body-muted">
              {discipline.blurb}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
