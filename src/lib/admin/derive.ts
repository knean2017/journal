/**
 * The values the admin panel works out for the editor rather than asking for.
 *
 * Everything here is pure and free of React, so the rules can be tested
 * directly and used from both the client form and the server action.
 */

/**
 * A title turned into the lowercase hyphenated form the database stores.
 *
 * Accented letters are folded to their plain equivalents rather than dropped,
 * so "Läw & Policy" becomes "law-policy" and not "l-w-policy".
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    // The combining marks NFKD has just split off the letters they sat on.
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Fills `{field}` placeholders from the record, then slugifies the result.
 *
 * A pattern rather than a function because the field definitions cross the
 * server-to-client boundary as props, and a function cannot be serialised.
 */
export function fillPattern(pattern: string, values: Record<string, unknown>): string {
  const filled = pattern.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]
    return value === null || value === undefined ? '' : String(value)
  })
  return slugify(filled)
}

/**
 * The heading a record is known by in the panel.
 *
 * An issue has no title column worth reading: `titleColumn` is its slug, so the
 * list and the edit page both used to head it "volume-1-issue-1". A template
 * assembles something an editor recognises out of the columns that do read.
 */
export function recordTitle(
  entity: { titleColumn: string; titleTemplate?: string },
  row: Record<string, unknown>,
  fallback: string,
): string {
  if (entity.titleTemplate) {
    const filled = entity.titleTemplate.replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = row[key]
      return value === null || value === undefined ? '' : String(value)
    })
    if (filled.replace(/[^a-z0-9]/gi, '')) return filled
  }

  const title = row[entity.titleColumn]
  return title === null || title === undefined || title === '' ? fallback : String(title)
}

/** The wording a status carries out of the box, or '' if the status is unknown. */
export function standardLabel(
  options: { value: string; label: string }[],
  status: string,
): string {
  return options.find((option) => option.value === status)?.label ?? ''
}

/**
 * The status wording to show after the editor picks a different status.
 *
 * Deriving it outright would be wrong: Issue 2 ships as "In preparation" with
 * the wording "Scheduled", which somebody chose on purpose. So the wording only
 * follows the status while it is empty or still reads as the previous status's
 * standard wording. Once it has been edited it is left alone.
 */
export function nextStatusLabel(
  options: { value: string; label: string }[],
  currentLabel: string,
  previousStatus: string,
  nextStatus: string,
): string {
  if (currentLabel.trim() === '') return standardLabel(options, nextStatus)
  if (currentLabel === standardLabel(options, previousStatus)) {
    return standardLabel(options, nextStatus)
  }
  return currentLabel
}

/**
 * A Postgres error turned into something an editor can act on.
 *
 * The raw text names constraints and columns, which tells whoever reads it
 * nothing about what to change on the screen in front of them.
 */
export function friendlyError(message: string, what: string): string {
  if (/duplicate key value|unique constraint/i.test(message)) {
    // The constraint is named after its column, which is how we can say which.
    const clashed = /constraint "[a-z_]*?_?(slug|email|name)_?[a-z_]*?"/i.exec(message)?.[1]
    if (clashed === 'slug') {
      return `Another ${what} already uses that web address. Try adding a word to tell them apart.`
    }
    return clashed
      ? `Another ${what} already uses that ${clashed}.`
      : `Another ${what} already uses one of these values.`
  }
  if (/violates foreign key constraint/i.test(message)) {
    return 'Something this record points at has been deleted. Check the section and issue, then save again.'
  }
  if (/violates not-null constraint|null value in column/i.test(message)) {
    const column = /column "([^"]+)"/.exec(message)?.[1]
    return column
      ? `${column.replace(/_/g, ' ')} cannot be left empty.`
      : 'A required field was left empty.'
  }
  if (/invalid input syntax|invalid input value/i.test(message)) {
    return 'One of the values is not in a form the database accepts. Check the dates and numbers.'
  }
  return `Could not save: ${message}`
}

/**
 * Sequential order numbers after moving one row up or down.
 *
 * Returns every row with the position it should now hold, which repairs a list
 * whose numbers were duplicated or left with gaps at the same time. Out-of-range
 * moves return the list unchanged rather than throwing, so the first row's "up"
 * button is simply inert.
 */
export function reorder<T extends { id: string }>(
  rows: T[],
  id: string,
  direction: 'up' | 'down',
): { id: string; sort_order: number }[] {
  const from = rows.findIndex((row) => row.id === id)
  if (from === -1) return []

  const to = direction === 'up' ? from - 1 : from + 1
  if (to < 0 || to >= rows.length) return []

  const moved = [...rows]
  const [row] = moved.splice(from, 1)
  moved.splice(to, 0, row)

  return moved.map((item, index) => ({ id: item.id, sort_order: index + 1 }))
}
