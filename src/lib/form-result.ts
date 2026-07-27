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
