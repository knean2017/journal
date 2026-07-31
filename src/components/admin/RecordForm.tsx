'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState } from 'react'
import { FieldInput, type Choice } from './FieldInput'
import { deleteRecord, saveRecord } from '@/lib/admin/actions'
import { fillPattern, nextStatusLabel } from '@/lib/admin/derive'
import type { Entity, Field } from '@/lib/admin/entities'
import type { FormResult } from '@/lib/form-result'

type Values = Record<string, string | boolean>

/** The stored value in the shape the input wants to edit it in. */
function initialValue(field: Field, record: Record<string, unknown> | null): string | boolean {
  const raw = record?.[field.name]
  if (field.type === 'boolean') return raw === true
  if (field.type === 'tags') return Array.isArray(raw) ? raw.join('\n') : ''
  return raw === null || raw === undefined ? '' : String(raw)
}

export function RecordForm({
  entity,
  record,
  disciplines,
  issues,
  base,
}: {
  entity: Entity
  record: Record<string, unknown> | null
  disciplines: Choice[]
  issues: Choice[]
  base: string
}) {
  const id = record ? String(record.id) : null
  const isNew = id === null

  const [initial] = useState<Values>(() =>
    Object.fromEntries(entity.fields.map((field) => [field.name, initialValue(field, record)])),
  )
  const [values, setValues] = useState<Values>(initial)

  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    saveRecord.bind(null, entity.slug, id),
    null,
  )

  const dirty = entity.fields.some((field) => values[field.name] !== initial[field.name])

  /*
   * A record edited down to the last field and then navigated away from used to
   * go with the page. The browser's own warning is the only one that catches a
   * closed tab or a typed address, so it is the one used. Saving is a
   * navigation too, hence `pending`: the guard has to be down before the
   * redirect that follows a successful save.
   */
  useEffect(() => {
    if (!dirty || pending) return

    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, pending])

  /**
   * One write, plus whatever the panel works out from it.
   *
   * A new record's web address follows its title until it is saved. The status
   * wording follows the status for as long as it has not been edited by hand.
   * Both are worked out here rather than in an effect, so they only ever move
   * in response to something the editor actually did.
   */
  function setValue(name: string, value: string | boolean) {
    setValues((current) => {
      const next: Values = { ...current, [name]: value }

      if (isNew) {
        for (const field of entity.fields) {
          if (field.type !== 'slug' || !field.pattern) continue
          if (field.from?.includes(name)) next[field.name] = fillPattern(field.pattern, next)
        }
      }

      for (const field of entity.fields) {
        if (field.followsStatus !== name) continue
        const status = entity.fields.find((other) => other.name === name)
        if (!status?.options) continue
        next[field.name] = nextStatusLabel(
          status.options,
          String(current[field.name] ?? ''),
          String(current[name] ?? ''),
          String(value),
        )
      }

      return next
    })
  }

  const plain = entity.fields.filter((field) => !field.advanced)
  const advanced = entity.fields.filter((field) => field.advanced)

  /*
   * Records with a page of their own get a link to it, so a change can be
   * checked where readers will see it. It follows the field rather than the
   * saved record, which is right for everything except an unsaved rename: the
   * old address is gone the moment you save anyway.
   */
  const publicField = entity.fields.find((field) => field.type === 'slug' && field.urlPrefix)
  const publicHref =
    !isNew && publicField && values[publicField.name]
      ? `${publicField.urlPrefix}${String(values[publicField.name])}`
      : null

  function render(field: Field) {
    return (
      <FieldInput
        key={field.name}
        field={field}
        value={values[field.name] ?? ''}
        onChange={(value) => setValue(field.name, value)}
        disciplines={disciplines}
        issues={issues}
        isNew={isNew}
      />
    )
  }

  return (
    <>
      <form action={action} className="grid gap-5 max-w-[720px]">
        {state && !state.ok ? (
          <p
            role="alert"
            className="m-0 border border-maroon bg-cream-tint px-4 py-3 text-[14px] leading-[1.7] text-maroon"
          >
            {state.message}
          </p>
        ) : null}

        {plain.map(render)}

        {advanced.length > 0 ? (
          <details className="border-t border-rule pt-4">
            <summary className="text-[11.5px] tracking-[0.14em] uppercase font-bold text-gold-muted cursor-pointer">
              Advanced
            </summary>
            <p className="mt-3 mb-0 text-[13px] leading-[1.7] text-body-muted">
              The panel fills these in for you. Change them only if you have a reason to.
            </p>
            <div className="grid gap-5 mt-5">{advanced.map(render)}</div>
          </details>
        ) : null}

        {/*
          * Save travels with you. A long record used to put it below the last
          * field, so making one change near the top meant scrolling past
          * everything you had not touched to commit it.
          */}
        <div className="sticky bottom-0 flex gap-4 items-center flex-wrap bg-page border-t border-rule py-4">
          <button type="submit" disabled={pending} className="btn-base btn-maroon">
            {pending ? 'Saving…' : 'Save'}
          </button>
          <Link href={base} className="text-[11.5px] tracking-[0.14em] uppercase font-bold">
            Cancel
          </Link>

          {dirty && !pending ? (
            <span className="text-[12.5px] text-maroon">Unsaved changes</span>
          ) : null}

          {publicHref ? (
            <a
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-[11.5px] tracking-[0.14em] uppercase font-bold border-b border-gold pb-[2px]"
            >
              View on the site
            </a>
          ) : null}
        </div>
      </form>

      {id && entity.canDelete ? (
        <DeleteForm entity={entity} id={id} />
      ) : null}
    </>
  )
}

/**
 * Delete asks first. It is the one irreversible button on the screen, and it
 * used to sit one stray click away from the Save above it.
 */
function DeleteForm({ entity, id }: { entity: Entity; id: string }) {
  const [confirming, setConfirming] = useState(false)
  const noun = entity.label.toLowerCase()

  return (
    <form
      action={deleteRecord.bind(null, entity.slug, id)}
      className="mt-10 pt-6 border-t border-rule max-w-[720px]"
    >
      {confirming ? (
        <>
          <p className="mt-0 mb-3 text-[14px] leading-[1.7] text-maroon">
            Delete this {noun} for good? It disappears from the website straight away and cannot be
            brought back.
          </p>
          <div className="flex gap-3 items-center">
            <button type="submit" className="btn-base btn-maroon" formNoValidate>
              Yes, delete it
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-[11.5px] tracking-[0.14em] uppercase font-bold bg-transparent border-0 p-0 cursor-pointer"
            >
              Keep it
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn-base btn-outline"
          formNoValidate
        >
          Delete this {noun}
        </button>
      )}
    </form>
  )
}
