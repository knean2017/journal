'use client'

import { useToast } from '@/components/chrome/ToastProvider'
import { SUBMIT_TOAST } from '@/lib/toasts'
import type { Discipline } from '@/lib/content'

const LABEL = 'text-[11.5px] tracking-[0.14em] uppercase font-bold text-body'

export function SubmissionForm({ disciplines }: { disciplines: Discipline[] }) {
  const toast = useToast()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        // TODO(plan-3): replace with the real server action.
        toast(SUBMIT_TOAST)
      }}
      className="mt-[18px] border border-rule bg-cream px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Corresponding author</span>
          <input name="author" placeholder="Full name" className="field" />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Email</span>
          <input name="email" type="email" placeholder="you@university.edu" className="field" />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Institution</span>
          <input name="institution" placeholder="University or college" className="field" />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Section</span>
          <select name="section" className="field" defaultValue="">
            <option value="" disabled>
              Choose a section
            </option>
            {disciplines.map((discipline) => (
              <option key={discipline.slug} value={discipline.slug}>
                {discipline.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={LABEL}>Manuscript title</span>
        <input name="title" placeholder="Working title" className="field" />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={LABEL}>Abstract (250 words max)</span>
        <textarea
          name="abstract"
          rows={5}
          placeholder="State the question, method, and principal finding."
          className="field resize-y"
        />
      </label>

      <div className="mt-5 border border-dashed border-gold bg-cream-tint p-[22px] text-center">
        <div className="font-serif text-[16px] text-maroon">Attach anonymised manuscript</div>
        <p className="mt-[6px] mb-0 text-[13px] text-body-muted">
          PDF or DOCX · max 20 MB · no author names in the file
        </p>
      </div>

      <label className="flex gap-[11px] items-start mt-5 text-[13.5px] leading-[1.7] text-body">
        <input type="checkbox" name="originality" className="mt-[3px]" />
        <span>
          I confirm the work is original, unpublished, not under consideration elsewhere, and that
          all authors have approved this submission.
        </span>
      </label>

      <button type="submit" className="btn-base btn-maroon mt-[22px] px-[30px] py-[14px] text-[12px]">
        Submit manuscript
      </button>
    </form>
  )
}
