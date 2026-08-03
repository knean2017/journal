/**
 * How many columns a row of equal cards should use so the last row is never a
 * stray one or two.
 *
 * A grid that simply fits as many cards per row as the page allows breaks the
 * moment the content outgrows one row: five sections sit in a clean row, a
 * sixth turns that into five plus an orphan, which reads as a mistake rather
 * than a grid. Everything up to `max` stays on a single row; past that, the
 * column count that leaves the fewest empty cells in the last row wins, and on
 * a tie the wider grid does. Six cards go 3 + 3, eight go 4 + 4, ten go 5 + 5.
 *
 * Counts with no even split (seven, eleven) cannot be made whole by any column
 * count, so they settle for the arrangement with the shortest gap.
 */
export function balancedColumns(count: number, max: number): number {
  if (count <= max) return Math.max(count, 1)

  let best = max
  let fewestEmpty = Infinity

  for (let columns = max; columns >= 2; columns -= 1) {
    const empty = (columns - (count % columns)) % columns
    if (empty < fewestEmpty) {
      fewestEmpty = empty
      best = columns
    }
  }

  return best
}
