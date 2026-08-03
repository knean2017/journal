import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ListToolbar } from '@/components/admin/ListToolbar'
import { moveRecord } from '@/lib/admin/actions'
import { assetUrl } from '@/lib/admin/assets'
import { recordTitle } from '@/lib/admin/derive'
import { ENTITIES, findEntity } from '@/lib/admin/entities'
import { matchesQuery, param } from '@/lib/admin/filter'
import { permissionMatrix, requireCapability } from '@/lib/admin/session'
import { areaForEntity, can } from '@/lib/admin/permissions'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return ENTITIES.map((entity) => ({ entity: entity.slug }))
}

/** The status wording an entity carries, if it carries one. */
function chipOf(row: Record<string, unknown>): string | null {
  if (row.is_published === false) return 'Hidden'
  if (row.is_active === false) return 'Hidden'
  const label = row.status_label
  return typeof label === 'string' && label ? label : null
}

function MoveButton({
  entity,
  id,
  direction,
  disabled,
}: {
  entity: string
  id: string
  direction: 'up' | 'down'
  disabled: boolean
}) {
  async function move() {
    'use server'
    await moveRecord(entity, id, direction)
  }

  return (
    <form action={move}>
      <button
        type="submit"
        disabled={disabled}
        aria-label={direction === 'up' ? 'Move up' : 'Move down'}
        className="w-7 h-7 border border-rule bg-page text-[13px] text-body cursor-pointer disabled:opacity-30 disabled:cursor-default"
      >
        {direction === 'up' ? '↑' : '↓'}
      </button>
    </form>
  )
}

/** Whether a row is on the website, for the visibility filter. */
function isVisible(row: Record<string, unknown>): boolean {
  return row.is_published !== false && row.is_active !== false
}

export default async function EntityListPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { entity: slug } = await params
  const entity = findEntity(slug)
  if (!entity) notFound()

  /*
   * Gated after the slug is known, because which area governs depends on which
   * entity this is. An entity with no area mapping is a 404 rather than an open
   * door: it is not something this panel knows how to gate, so it does not show
   * it at all.
   */
  const area = areaForEntity(slug)
  if (!area) notFound()
  const { role } = await requireCapability(area, 'view')
  const canEdit = can(await permissionMatrix(), role, area, 'edit')

  const filters = await searchParams
  const query = param(filters.q)
  const status = param(filters.status)

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from(entity.table)
    .select('*')
    .order(entity.orderBy.column, { ascending: entity.orderBy.ascending })

  const base = `/${adminPath()}/${entity.slug}`
  const allRows = data ?? []

  const rows = allRows.filter((row) => {
    if (status === 'visible' && !isVisible(row)) return false
    if (status === 'hidden' && isVisible(row)) return false

    return matchesQuery(query, [
      recordTitle(entity, row, ''),
      ...entity.listColumns.map((column) => {
        const value = row[column]
        return typeof value === 'string' ? value : null
      }),
    ])
  })

  /*
   * The arrows move a record against the one above or below it in the list.
   * A filtered list is not that list, so they are hidden while one is in force
   * rather than left to shuffle records past rows you cannot see.
   */
  const filtered = Boolean(query || status)
  const sortable =
    entity.orderBy.column === 'sort_order' && allRows.length > 1 && !filtered && canEdit
  const hasVisibility = allRows.some(
    (row) => 'is_published' in row || 'is_active' in row,
  )

  return (
    <>
      <div className="flex items-baseline justify-between gap-5 flex-wrap">
        <h1 className="m-0 font-serif text-[28px] font-normal">{entity.plural}</h1>
        {entity.canCreate && canEdit ? (
          <Link href={`${base}/new`} className="btn-base btn-maroon">
            Add {entity.label.toLowerCase()}
          </Link>
        ) : null}
      </div>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">
          Could not load the list. {error.message}
        </p>
      ) : null}

      {allRows.length > 0 ? (
        <ListToolbar
          action={base}
          query={query}
          status={status}
          statuses={
            hasVisibility
              ? [
                  { value: 'visible', label: 'On the website' },
                  { value: 'hidden', label: 'Hidden' },
                ]
              : undefined
          }
          placeholder={`Search ${entity.plural.toLowerCase()}`}
          shown={rows.length}
          total={allRows.length}
        />
      ) : null}

      {sortable ? (
        <p className="mt-4 mb-0 text-[13px] text-body-muted">
          The arrows change the order these appear in on the website.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-6 border-t border-rule">
          {rows.map((row, index) => {
            const id = String(row.id)
            const thumbnail = entity.thumbnailColumn ? row[entity.thumbnailColumn] : null
            const chip = chipOf(row)

            /*
             * The same two lines whether or not they are a link. Somebody with
             * view but not edit still reads the list; the record page behind it
             * is a form, so it is gated on edit and they are not sent there.
             */
            const summary = (
              <>
                <span className="block font-serif text-[17px] truncate">
                  {recordTitle(entity, row, '(no title yet)')}
                </span>
                {entity.listColumns.length > 0 ? (
                  <span className="block mt-1 text-[13px] text-body-muted truncate">
                    {entity.listColumns
                      .map((column) => row[column])
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ) : null}
              </>
            )

            return (
              <div
                key={id}
                className="flex gap-4 items-center py-4 border-b border-rule hover:bg-cream"
              >
                {sortable ? (
                  <div className="flex flex-col gap-1 flex-none">
                    <MoveButton
                      entity={entity.slug}
                      id={id}
                      direction="up"
                      disabled={index === 0}
                    />
                    <MoveButton
                      entity={entity.slug}
                      id={id}
                      direction="down"
                      disabled={index === rows.length - 1}
                    />
                  </div>
                ) : null}

                {entity.thumbnailColumn ? (
                  <div className="flex-none w-[54px] h-[64px] border border-rule bg-cream grid place-items-center overflow-hidden">
                    {typeof thumbnail === 'string' && thumbnail ? (
                      /* Bucket contents are arbitrary uploads, so next/image is not used here. */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={assetUrl(thumbnail, 'image')}
                        alt=""
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      <span className="text-[9px] tracking-[0.12em] uppercase text-gold-muted text-center px-1">
                        No photo
                      </span>
                    )}
                  </div>
                ) : null}

                {canEdit ? (
                  <Link href={`${base}/${id}`} className="min-w-0 flex-1 text-ink hover:text-ink">
                    {summary}
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1 text-ink">{summary}</div>
                )}

                {chip ? (
                  <span className="flex-none border border-rule bg-cream px-[9px] py-[3px] text-[10.5px] tracking-[0.12em] uppercase font-bold text-gold-muted">
                    {chip}
                  </span>
                ) : null}

                {canEdit ? (
                  <Link
                    href={`${base}/${id}`}
                    className="flex-none text-[11.5px] tracking-[0.12em] uppercase text-maroon font-bold"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : error ? null : allRows.length > 0 ? (
        <p className="mt-7 text-[14px] text-body-muted">
          Nothing matches that. Clear the filters to see all {allRows.length}.
        </p>
      ) : (
        <p className="mt-6 text-[14px] text-body-muted">
          Nothing here yet. Use the button above to add the first one.
        </p>
      )}
    </>
  )
}
