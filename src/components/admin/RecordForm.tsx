import Link from 'next/link'
import { FieldInput, type Choice } from './FieldInput'
import { deleteRecord, saveRecord } from '@/lib/admin/actions'
import { adminPath } from '@/lib/supabase/env'
import type { Entity } from '@/lib/admin/entities'

export function RecordForm({
  entity,
  record,
  disciplines,
  issues,
}: {
  entity: Entity
  record: Record<string, unknown> | null
  disciplines: Choice[]
  issues: Choice[]
}) {
  const id = record ? String(record.id) : null
  const base = `/${adminPath()}/${entity.slug}`

  async function save(form: FormData) {
    'use server'
    await saveRecord(entity.slug, id, form)
  }

  async function remove() {
    'use server'
    if (id) await deleteRecord(entity.slug, id)
  }

  return (
    <>
      <form action={save} className="grid gap-5 max-w-[720px]">
        {entity.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={record?.[field.name] ?? null}
            disciplines={disciplines}
            issues={issues}
          />
        ))}

        <div className="flex gap-3 items-center pt-2">
          <button type="submit" className="btn-base btn-maroon">
            Save
          </button>
          <Link href={base} className="text-[11.5px] tracking-[0.14em] uppercase font-bold">
            Cancel
          </Link>
        </div>
      </form>

      {id && entity.canDelete ? (
        <form action={remove} className="mt-10 pt-6 border-t border-rule max-w-[720px]">
          <button
            type="submit"
            className="btn-base btn-outline"
            // No undo, so make the click deliberate.
            formNoValidate
          >
            Delete this {entity.label.toLowerCase()}
          </button>
          <p className="mt-3 mb-0 text-[12.5px] text-body-muted">
            Permanent. There is no undo, and the public site updates immediately.
          </p>
        </form>
      ) : null}
    </>
  )
}
