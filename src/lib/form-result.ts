/**
 * The shape every public form action returns, and the helper that flattens Zod
 * issues into it.
 *
 * This lives outside the action files because a `'use server'` module may only
 * export async functions, so shared helpers cannot live there. Do not re-export
 * FormResult from an action file either: the server-actions transform turns
 * `export type { FormResult }` into a runtime binding and the module throws
 * "FormResult is not defined" on first import. Import it from here.
 */
export type FormResult = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

/** One storage path the browser may write to once. */
export type SignedUpload = { path: string; token: string }

/**
 * A manuscript submission's first half: the one-time credentials the browser
 * needs to put the two files into storage itself. Present only when `ok` is
 * true, and then both are, because a submission is the pair or it is nothing.
 */
export type UploadTarget = FormResult & {
  uploads?: { manuscript: SignedUpload; coverLetter: SignedUpload }
}

/**
 * A form value as text, treating a missing field as empty.
 *
 * A select whose placeholder option is `disabled` posts nothing at all: the
 * form data algorithm skips disabled options, so the field is absent rather
 * than empty. Passing that null through to a string schema produced "Invalid
 * input: expected string, received null" where the form should have said
 * "Please choose a section."
 */
export function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value : ''
}

/** First message per field. Later issues on the same field are noise to a form. */
export function firstErrors(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}
