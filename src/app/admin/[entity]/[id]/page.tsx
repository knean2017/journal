import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RecordForm } from '@/components/admin/RecordForm'
import { findEntity } from '@/lib/admin/entities'
import { loadLookups } from '@/lib/admin/lookups'
import { requireAdmin } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function EntityRecordPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>
}) {
  await requireAdmin()

  const { entity: slug, id } = await params
  const entity = findEntity(slug)
  if (!entity) notFound()

  const isNew = id === 'new'
  const supabase = createSupabaseServiceClient()

  let record: Record<string, unknown> | null = null
  if (!isNew) {
    const { data } = await supabase.from(entity.table).select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    record = data
  }

  const { disciplines, issues } = await loadLookups()
  const base = `/${adminPath()}/${entity.slug}`

  return (
    <>
      <Link href={base} className="text-[11.5px] tracking-[0.14em] uppercase font-bold">
        ← {entity.plural}
      </Link>

      <h1 className="mt-4 mb-0 font-serif text-[28px] font-normal">
        {isNew ? `New ${entity.label.toLowerCase()}` : String(record?.[entity.titleColumn] ?? '')}
      </h1>
      <div className="rule-double mt-5 mb-7" />

      <RecordForm entity={entity} record={record} disciplines={disciplines} issues={issues} />
    </>
  )
}
