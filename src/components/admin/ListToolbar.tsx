'use client'

import Link from 'next/link'

export type StatusOption = { value: string; label: string }

/**
 * Search, status, and order for a list, as a plain GET form.
 *
 * The filters live in the address rather than in component state, so a filtered
 * list can be reloaded, bookmarked, or kept through the page reload a save
 * causes. The selects submit themselves on change; the search box submits on
 * Enter, and on the button for anyone who does not think to press it.
 */
export function ListToolbar({
  action,
  query,
  status,
  statuses,
  sort,
  sortable = false,
  placeholder = 'Search',
  shown,
  total,
}: {
  /** Where the form posts back to: the list's own path. */
  action: string
  query: string
  status?: string
  statuses?: StatusOption[]
  sort?: string
  sortable?: boolean
  placeholder?: string
  shown: number
  total: number
}) {
  const filtered = Boolean(query || status || sort)

  return (
    <div className="mt-6">
      <form method="get" action={action} className="flex gap-3 flex-wrap items-end">
        <label className="flex flex-col gap-[6px]">
          <span className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
            Search
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={placeholder}
            className="field w-[min(100%,260px)] text-[14px]"
          />
        </label>

        {statuses && statuses.length > 0 ? (
          <label className="flex flex-col gap-[6px]">
            <span className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={status ?? ''}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className="field w-auto text-[14px]"
            >
              <option value="">All</option>
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {sortable ? (
          <label className="flex flex-col gap-[6px]">
            <span className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
              Order
            </span>
            <select
              name="sort"
              defaultValue={sort ?? ''}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className="field w-auto text-[14px]"
            >
              <option value="">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        ) : null}

        <button type="submit" className="btn-base btn-outline">
          Filter
        </button>

        {filtered ? (
          <Link href={action} className="text-[11.5px] tracking-[0.14em] uppercase font-bold">
            Clear
          </Link>
        ) : null}
      </form>

      <p className="mt-3 mb-0 text-[13px] text-body-muted">
        {shown === total
          ? `${total} ${total === 1 ? 'record' : 'records'}`
          : `Showing ${shown} of ${total}`}
      </p>
    </div>
  )
}
