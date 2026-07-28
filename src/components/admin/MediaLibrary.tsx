'use client'

import { useState } from 'react'
import { deleteAsset, uploadAsset } from '@/lib/admin/actions'

type MediaFile = { name: string; url: string }

export function MediaLibrary({ files }: { files: MediaFile[] }) {
  const [items, setItems] = useState(files)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('kind', 'image')
      const path = await uploadAsset(form)
      setItems((current) => [
        { name: path, url: `${items[0]?.url.split('/media/')[0] ?? ''}/media/${path}` },
        ...current,
      ])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(name: string) {
    setError('')
    try {
      await deleteAsset('media', name)
      setItems((current) => current.filter((item) => item.name !== name))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Delete failed')
    }
  }

  return (
    <>
      <div className="border border-dashed border-gold bg-cream-tint p-6 text-center">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <p className="mt-2 mb-0 text-[13px] text-body-muted">
          PNG, JPEG, or WebP · max 8 MB{busy ? ' · uploading…' : ''}
        </p>
      </div>

      {error ? <p className="mt-4 text-[13px] text-maroon">{error}</p> : null}

      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-5 mt-7">
        {items.map((item) => (
          <div key={item.name} className="border border-rule bg-page p-3">
            {/* Bucket contents are arbitrary user uploads, so next/image is not used here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="w-full h-[130px] object-cover block" />
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(item.name)
                  setCopied(item.name)
                }}
                className="text-[11px] tracking-[0.12em] uppercase font-bold text-maroon bg-transparent border-0 p-0 cursor-pointer"
              >
                {copied === item.name ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => void remove(item.name)}
                className="text-[11px] tracking-[0.12em] uppercase font-bold text-gold-muted bg-transparent border-0 p-0 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-[14px] text-body-muted">No images uploaded yet.</p>
      ) : null}
    </>
  )
}
