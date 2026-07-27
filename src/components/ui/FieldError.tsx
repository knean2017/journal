/** Shared bits for the public forms, so their fields look identical. */

export const FIELD_LABEL = 'text-[11.5px] tracking-[0.14em] uppercase font-bold text-body'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-[12.5px] text-maroon">{message}</span>
}
