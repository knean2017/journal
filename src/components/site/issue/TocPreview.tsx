import Link from 'next/link'
import { ToastButton } from '@/components/ui/ToastButton'
import { PDF_TOAST } from '@/lib/toasts'
import type { TocPreviewEntry } from '@/lib/content'

export function TocPreview({
  entries,
  templateSlug,
}: {
  entries: TocPreviewEntry[]
  templateSlug: string
}) {
  return (
    <div data-testid="toc-preview" className="mt-5 border-t border-rule">
      {entries.map((entry) => (
        <div
          key={entry.title}
          className="grid [grid-template-columns:1fr_auto] gap-6 items-start py-[22px] border-b border-rule opacity-55"
        >
          <div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              {entry.section}
            </div>
            <Link
              href={`/articles/${templateSlug}`}
              className="block mt-[7px] font-serif text-[20px] leading-[1.45] text-ink"
            >
              {entry.title}
            </Link>
            <div className="mt-[6px] text-[14px] text-body-muted">{entry.byline}</div>
          </div>
          <div className="flex gap-[10px] items-center">
            <span className="text-[11.5px] tracking-[0.12em] uppercase text-gold-muted">
              {entry.pages}
            </span>
            <ToastButton
              message={PDF_TOAST}
              className="border border-rule px-3 py-[7px] text-[11px] tracking-[0.12em] uppercase font-bold text-maroon"
            >
              PDF
            </ToastButton>
          </div>
        </div>
      ))}
    </div>
  )
}
