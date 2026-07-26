'use client'

import { useState } from 'react'
import { uploadAsset } from '@/lib/admin/actions'
import type { Field } from '@/lib/admin/entities'

export type Choice = { value: string; label: string }

const LABEL = 'text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted'

function AssetInput({ field, value }: { field: Field; value: string }) {
  const [path, setPath] = useState(value)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('kind', field.type === 'pdf' ? 'pdf' : 'image')
      setPath(await uploadAsset(form))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={field.name} value={path} />

      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="file"
          accept={field.type === 'pdf' ? '.pdf,.docx' : 'image/png,image/jpeg,image/webp'}
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
          className="text-[13px]"
        />
        {busy ? <span className="text-[12px] text-body-muted">Uploading…</span> : null}
        {path ? (
          <button
            type="button"
            onClick={() => setPath('')}
            className="text-[11px] tracking-[0.12em] uppercase font-bold text-maroon cursor-pointer bg-transparent border-0 p-0"
          >
            Clear
          </button>
        ) : null}
      </div>

      {path ? <div className="text-[12px] text-body-muted break-all">{path}</div> : null}
      {error ? <div className="text-[12px] text-maroon">{error}</div> : null}
    </div>
  )
}

export function FieldInput({
  field,
  value,
  disciplines = [],
  issues = [],
}: {
  field: Field
  value: unknown
  disciplines?: Choice[]
  issues?: Choice[]
}) {
  const text = value === null || value === undefined ? '' : String(value)

  return (
    <label className="flex flex-col gap-[7px]">
      <span className={LABEL}>
        {field.label}
        {field.required ? ' *' : ''}
      </span>

      {field.type === 'textarea' ? (
        <textarea name={field.name} defaultValue={text} rows={5} className="field resize-y" />
      ) : field.type === 'richtext' ? (
        <textarea
          name={field.name}
          defaultValue={typeof value === 'string' ? value : value ? JSON.stringify(value) : ''}
          rows={12}
          className="field resize-y font-mono text-[12.5px]"
        />
      ) : field.type === 'tags' ? (
        <textarea
          name={field.name}
          defaultValue={Array.isArray(value) ? value.join('\n') : ''}
          rows={4}
          className="field resize-y"
        />
      ) : field.type === 'boolean' ? (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={value === true}
          className="w-4 h-4"
        />
      ) : field.type === 'select' ? (
        <select name={field.name} defaultValue={text} className="field">
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'discipline' || field.type === 'issue' ? (
        <select name={field.name} defaultValue={text} className="field">
          <option value="">Not set</option>
          {(field.type === 'discipline' ? disciplines : issues).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'image' || field.type === 'pdf' ? (
        <AssetInput field={field} value={text} />
      ) : (
        <input
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          name={field.name}
          defaultValue={text}
          required={field.required}
          className="field"
        />
      )}

      {field.help ? <span className="text-[12px] text-body-muted">{field.help}</span> : null}
    </label>
  )
}
