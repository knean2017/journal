'use client'

import { useActionState, useState } from 'react'
import { FieldInput } from './FieldInput'
import { saveSiteConfig } from '@/lib/admin/actions'
import type { Field } from '@/lib/admin/entities'
import type { FormResult } from '@/lib/form-result'

export function SettingsForm({
  fields,
  record,
}: {
  fields: Field[]
  record: Record<string, unknown> | null
}) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      fields.map((field) => {
        const raw = record?.[field.name]
        if (field.type === 'boolean') return [field.name, raw === true]
        return [field.name, raw === null || raw === undefined ? '' : String(raw)]
      }),
    ),
  )

  const [state, action, pending] = useActionState<FormResult | null, FormData>(saveSiteConfig, null)

  return (
    <form action={action} className="grid gap-5 max-w-[720px]">
      {state ? (
        <p
          role="alert"
          className={`m-0 border px-4 py-3 text-[14px] leading-[1.7] ${
            state.ok
              ? 'border-rule bg-cream text-body'
              : 'border-maroon bg-cream-tint text-maroon'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          value={values[field.name] ?? ''}
          onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
        />
      ))}

      <div className="pt-2">
        <button type="submit" disabled={pending} className="btn-base btn-maroon">
          {pending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
