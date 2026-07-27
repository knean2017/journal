import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ENTITIES, findEntity } from '@/lib/admin/entities'
import { requireAdmin } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return ENTITIES.map((entity) => ({ entity: entity.slug }))
}

export default async function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  await requireAdmin()

  const { entity: slug } = await params
  const entity = findEntity(slug)
  if (!entity) notFound()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from(entity.table)
    .select('*')
    .order(entity.orderBy.column, { ascending: entity.orderBy.ascending })

  const base = `/${adminPath()}/${entity.slug}`

  return (
    <>
      <div className="flex items-baseline justify-between gap-5 flex-wrap">
        <h1 className="m-0 font-serif text-[28px] font-normal">{entity.plural}</h1>
        {entity.canCreate ? (
          <Link href={`${base}/new`} className="btn-base btn-maroon">
            Add {entity.label.toLowerCase()}
          </Link>
        ) : null}
      </div>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">Could not load: {error.message}</p>
      ) : null}

      {data && data.length > 0 ? (
        <div className="mt-6 border-t border-rule">
          {data.map((row) => (
            <Link
              key={String(row.id)}
              href={`${base}/${row.id}`}
              className="grid [grid-template-columns:minmax(0,1fr)_auto] gap-5 items-baseline py-4 border-b border-rule text-ink hover:bg-cream hover:text-ink"
            >
              <span className="min-w-0">
                <span className="block font-serif text-[17px] truncate">
                  {String(row[entity.titleColumn] ?? '(untitled)')}
                </span>
                {entity.listColumns.length > 0 ? (
                  <span className="block mt-1 text-[13px] text-body-muted truncate">
                    {entity.listColumns
                      .map((column) => row[column])
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ) : null}
              </span>
              <span className="text-[11.5px] tracking-[0.12em] uppercase text-gold-muted font-bold">
                {row.is_published === false ? 'Hidden' : 'Edit'}
              </span>
            </Link>
          ))}
        </div>
      ) : !error ? (
        <p className="mt-6 text-[14px] text-body-muted">Nothing here yet.</p>
      ) : null}
    </>
  )
}
