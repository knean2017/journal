'use client'

import { useState } from 'react'
import { uploadAsset } from '@/lib/admin/actions'
import { assetUrl } from '@/lib/admin/assets'
import type { Field } from '@/lib/admin/entities'

export type Choice = { value: string; label: string }

const LABEL = 'text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted'

/**
 * Upload, preview, replace, remove.
 *
 * The stored path is a random UUID, which told an editor nothing about whether
 * the right picture had gone in. It is kept out of sight now and the picture
 * itself is the confirmation.
 */
function AssetInput({
  field,
  value,
  onChange,
}: {
  field: Field
  value: string
  onChange: (value: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isPdf = field.type === 'pdf'

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('kind', isPdf ? 'pdf' : 'image')
      onChange(await uploadAsset(form))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The upload did not work. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={field.name} value={value} />

      {value ? (
        <div className="flex gap-4 items-start flex-wrap">
          {isPdf ? (
            <a
              href={assetUrl(value, 'pdf')}
              target="_blank"
              rel="noreferrer"
              className="grid place-items-center w-[110px] h-[130px] border border-rule bg-cream text-[11px] tracking-[0.14em] uppercase font-bold text-maroon"
            >
              Open PDF
            </a>
          ) : (
            /* Bucket contents are arbitrary uploads, so next/image is not used here. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={assetUrl(value, 'image')}
              alt=""
              className="w-[110px] h-[130px] object-cover block border border-rule bg-cream"
            />
          )}

          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-body-muted">
              {isPdf ? 'A file is attached.' : 'This is what the website will show.'}
            </span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] tracking-[0.12em] uppercase font-bold text-maroon cursor-pointer bg-transparent border-0 p-0 text-left"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="file"
          aria-label={value ? `Replace the ${field.label.toLowerCase()}` : field.label}
          accept={isPdf ? '.pdf,.docx' : 'image/png,image/jpeg,image/webp'}
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
          className="text-[13px]"
        />
        {busy ? <span className="text-[12px] text-body-muted">Uploading…</span> : null}
      </div>

      {error ? <div className="text-[12px] text-maroon">{error}</div> : null}
    </div>
  )
}

/**
 * The web address, written from the title rather than asked for.
 *
 * It stays read-only until the editor opens the override, because on a record
 * that is already published changing it silently breaks every link anyone has
 * to the page.
 */
function SlugInput({
  field,
  value,
  onChange,
  isNew,
}: {
  field: Field
  value: string
  onChange: (value: string) => void
  isNew: boolean
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={field.name} value={value} />

      {editing ? (
        <>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="field"
            aria-label={field.label}
          />
          {field.urlPrefix ? (
            <span className="text-[12.5px] text-maroon">
              Changing this breaks every link anyone already has to this page.
            </span>
          ) : null}
        </>
      ) : (
        <div className="flex gap-3 items-baseline flex-wrap">
          <span className="text-[14px] text-ink break-all">
            {value ? (
              <>
                {field.urlPrefix}
                <strong className="font-bold">{value}</strong>
              </>
            ) : (
              <span className="text-body-muted">
                Filled in as soon as you type the {field.from?.join(' and ') ?? 'title'} above.
              </span>
            )}
          </span>
          {!isNew && value ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[11px] tracking-[0.12em] uppercase font-bold text-gold-muted cursor-pointer bg-transparent border-0 p-0"
            >
              Change
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function FieldInput({
  field,
  value,
  onChange,
  disciplines = [],
  issues = [],
  isNew = false,
}: {
  field: Field
  value: string | boolean
  onChange: (value: string | boolean) => void
  disciplines?: Choice[]
  issues?: Choice[]
  isNew?: boolean
}) {
  const text = typeof value === 'boolean' ? '' : value

  /*
   * A <label> may only wrap a field that is a single form control. The web
   * address and the asset uploader carry buttons of their own, and <button> is
   * a labelable element: wrapped in a label, "Change" and "Remove" take the
   * whole label's text as their accessible name and a screen reader announces
   * a paragraph instead of a verb.
   */
  const Wrapper = field.type === 'slug' || field.type === 'image' || field.type === 'pdf'
    ? 'div'
    : 'label'

  return (
    <Wrapper className="flex flex-col gap-[7px]">
      <span className={LABEL}>
        {field.label}
        {field.required ? ' *' : ''}
      </span>

      {field.type === 'textarea' ? (
        <textarea
          name={field.name}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className="field resize-y"
        />
      ) : field.type === 'tags' ? (
        <textarea
          name={field.name}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="field resize-y"
        />
      ) : field.type === 'boolean' ? (
        <input
          type="checkbox"
          name={field.name}
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="w-4 h-4"
        />
      ) : field.type === 'select' ? (
        <select
          name={field.name}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="field"
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'discipline' || field.type === 'issue' ? (
        <select
          name={field.name}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="field"
        >
          <option value="">Not set</option>
          {(field.type === 'discipline' ? disciplines : issues).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'image' || field.type === 'pdf' ? (
        <AssetInput field={field} value={text} onChange={onChange} />
      ) : field.type === 'slug' ? (
        <SlugInput field={field} value={text} onChange={onChange} isNew={isNew} />
      ) : (
        <input
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          name={field.name}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          required={field.required}
          className="field"
        />
      )}

      {field.help ? <span className="text-[12px] text-body-muted">{field.help}</span> : null}
    </Wrapper>
  )
}
