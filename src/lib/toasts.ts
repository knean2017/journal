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
 * nothing is ever mailed to an address that has not opened the link.
 */
export const SUBSCRIBE_CONFIRM_TOAST =
  'Almost there. Open the link in the email we just sent to confirm the address.'

/**
 * Shown when the address was taken but the link did not go out.
 *
 * Deliberately not an error, and deliberately not the message above.
 *
 * A failed send used to fail the whole form, which is how signup came to be
 * broken for months: the mail provider refuses every recipient until a domain
 * is verified, so the address was thrown away and the reader was told to try
 * again in a few minutes, forever. The row is worth keeping either way. But
 * telling them to open a link that was never sent would be worse than the
 * error was, so this says what actually happened and gives them a person to
 * write to.
 */
export const SUBSCRIBE_PENDING_TOAST =
  'Your address is saved. The confirmation link has not gone out yet, so write to icrrjournal@gmail.com if it does not arrive.'

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
