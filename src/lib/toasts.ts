/**
 * Interim messages for affordances that have no backend yet.
 *
 * TODO(plan-3): each of these becomes a real action. Grep this file to find
 * every call site when the submission and PDF pipelines land.
 */
export const PDF_TOAST = 'Not available yet. PDFs and author links go live with Issue 1.'

export const SUBMIT_TOAST =
  'Submission portal opens with the call for papers. Email icrrjournal@gmail.com in the meantime.'

/**
 * Shown once an address has been taken and a confirmation link sent.
 *
 * It does not say "you are subscribed", because at this point they are not:
 * nothing is ever mailed to an address that has not opened the link. Promising
 * announcements here would be the same false confirmation the unconfigured
 * branch below used to give.
 */
export const SUBSCRIBE_CONFIRM_TOAST =
  'Almost there. Open the link in the email we just sent to confirm the address.'

/** Shown to somebody already confirmed and still on the list. */
export const SUBSCRIBE_ALREADY_TOAST = 'That address is already on the announcement list.'

/**
 * Shown when there is no database to record the address in.
 *
 * Deliberately not SUBSCRIBE_TOAST. That message promises future email, and
 * with Supabase absent nothing is stored, so nobody could ever be sent
 * anything: the address goes nowhere and the promise could not be kept. An
 * honest refusal with a way to reach the office is worth more than a
 * confirmation that is false, and it matches what the submission form already
 * does in the same situation.
 */
export const SUBSCRIBE_UNAVAILABLE_TOAST =
  'The announcement list opens with the call for papers. Email icrrjournal@gmail.com to be added in the meantime.'
