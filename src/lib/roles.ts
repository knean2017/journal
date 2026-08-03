import type { EditorialRole } from '@/lib/content'

/**
 * The colour each status takes on the team page.
 *
 * Keyed by the status union rather than written as a ternary, so a fourth
 * status added later is a type error here instead of a role quietly rendering
 * in the wrong colour. The previous ternary failed open: anything that was not
 * `pending` came out maroon, which would have made an appointed role read as
 * one that is still recruiting.
 *
 * Ink for appointed, over a green the palette has nowhere else and over
 * `--color-gold`, which sits too close to the muted gold pending already uses.
 */
const STATUS_COLOUR: Record<EditorialRole['status'], string> = {
  pending: '#8A7B5C', // gold-muted, waiting
  recruiting: '#5D1D21', // maroon, open to apply for
  appointed: '#241F1E', // ink, settled
}

/**
 * How a role's status line should read: its colour, and the name to show beside
 * it, if there is one to show.
 *
 * The status governs the name, not the other way round. A name is only returned
 * for an appointed role, so putting a role back to recruiting takes one change
 * in the admin and cannot leave a stale name on the site.
 *
 * Blank counts as absent. The admin panel's `coerce` writes '' for an empty text
 * field rather than null, so an editor who picks "Appointed" and saves without
 * typing a name would otherwise get a separator followed by nothing.
 */
export function roleStatusDisplay(role: EditorialRole): {
  colour: string
  holderName: string | null
} {
  const name = role.holderName?.trim()

  return {
    colour: STATUS_COLOUR[role.status],
    holderName: role.status === 'appointed' && name ? name : null,
  }
}
