/**
 * The list filters, kept in one place so every list behaves the same way.
 *
 * Filtering happens in memory, on rows already fetched. The tables behind this
 * panel hold a journal's worth of records, not a warehouse's, and a query the
 * database has already answered in full is cheaper to filter here than to ask
 * for again with a `ilike` on every column a list happens to show.
 */

/** One search box, matched against whatever the row puts on screen. */
export function matchesQuery(query: string, fields: (string | null | undefined)[]): boolean {
  const wanted = query.trim().toLowerCase()
  if (!wanted) return true

  return fields.some((field) => (field ?? '').toLowerCase().includes(wanted))
}

/** An empty status means every status, which is what "All" submits. */
export function matchesStatus(status: string, value: string | null | undefined): boolean {
  return !status || status === value
}

/** `?q=` and friends arrive as a string, an array, or not at all. */
export function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}
