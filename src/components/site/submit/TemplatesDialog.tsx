'use client'

import { useRef } from 'react'
import { TEMPLATES, formatBytes } from '@/lib/templates'

/**
 * The templates, offered without leaving the submission page.
 *
 * A native <dialog> rather than a div with a z-index: it comes with the modal
 * behaviour already correct. Escape closes it, focus is trapped inside it while
 * it is open and returned to the button afterwards, and the page behind it is
 * inert. None of that is worth reimplementing.
 */
export function TemplatesDialog({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={className}>
        {children}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="templates-dialog-title"
        /*
         * Clicking the backdrop closes it. The <dialog> box itself is the
         * backdrop's hit target, so a click that lands on this element and not
         * on the panel inside it came from outside the panel.
         */
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close()
        }}
        className="m-auto w-[min(560px,calc(100vw-32px))] max-h-[calc(100dvh-48px)] overflow-y-auto border border-maroon bg-page p-0 text-ink backdrop:bg-[rgba(36,31,30,0.55)]"
      >
        <div className="bg-maroon text-cream px-[clamp(16px,3vw,24px)] py-[13px] flex items-center justify-between gap-4">
          <h2
            id="templates-dialog-title"
            className="m-0 font-serif text-[16px] font-normal text-cream"
          >
            Author templates
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="flex-none border border-[rgba(247,244,239,0.45)] px-[9px] py-[2px] text-[14px] leading-none text-cream hover:bg-[rgba(247,244,239,0.12)]"
          >
            ✕
          </button>
        </div>

        <div className="px-[clamp(16px,3vw,24px)] py-[clamp(16px,3vw,22px)]">
          <p className="m-0 text-[13.5px] leading-[1.75] text-body">
            Using these is optional. A submission needs a manuscript and a cover letter, not these
            particular files, and a paper written in your own format is read no differently.
          </p>

          {TEMPLATES.map((template) => (
            <div key={template.id} className="mt-5 pt-5 border-t border-rule">
              <div className="font-serif text-[17px] font-bold text-maroon">{template.title}</div>
              <p className="mt-[6px] mb-0 text-[13.5px] leading-[1.75] text-body">
                {template.summary}
              </p>

              <div className="mt-3 flex gap-[10px] flex-wrap items-center">
                <a
                  href={template.docx.href}
                  download
                  className="btn-base btn-maroon px-[18px] py-[10px] text-[11px]"
                >
                  Word (.docx)
                </a>
                <span className="text-[12px] text-body-muted">
                  {formatBytes(template.docx.bytes)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </dialog>
    </>
  )
}
