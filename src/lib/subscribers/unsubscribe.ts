/**
 * Taking an address off the announcement list.
 *
 * Pure and free of React, Next, and the database, so the token rule can be
 * unit tested directly and the route and the action cannot disagree about what
 * a valid link looks like.
 */

import { z } from 'zod'

/**
 * What an unsubscribe link has to carry.
 *
 * A uuid and nothing else. Anything shorter, longer, or differently shaped is
 * refused before a query is built, so a malformed token never reaches Postgres
 * as a uuid comparison it would raise on.
 */
export const unsubscribeTokenSchema = z.string().trim().uuid()

/** The outcomes the unsubscribe page can render. */
export type UnsubscribeState =
  /** The link carried no token, or one that is not a uuid. */
  | { status: 'invalid' }
  /** A well-formed token that matches no row. */
  | { status: 'unknown' }
  /** Taken off the list just now. */
  | { status: 'done'; email: string }
  /** Already off the list. The link was followed twice, or the row was never active. */
  | { status: 'already'; email: string }
  /** The database could not be reached, or refused the write. */
  | { status: 'error' }

/**
 * The link that goes at the foot of every announcement.
 *
 * Absolute, because it is read inside a mail client that has no page to
 * resolve a relative path against.
 */
export function unsubscribeUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/unsubscribe?token=${encodeURIComponent(token)}`
}

/** The link in the one email an unconfirmed address is ever sent. */
export function confirmUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/subscribe/confirm?token=${encodeURIComponent(token)}`
}
