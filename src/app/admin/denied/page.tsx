import Link from 'next/link'
import { AREA_LABELS, AREAS, ROLE_LABELS, type Area } from '@/lib/admin/permissions'
import { requireAdmin } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'

/**
 * Where a gate sends somebody who is signed in but may not be here.
 *
 * It says which part of the panel was refused and what they are, because the
 * alternative is a person quietly finding a link missing and assuming the
 * panel is broken. It does not offer a way in: the fix is for an administrator
 * to change the grid, not for this page to do anything.
 */
export default async function DeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>
}) {
  const admin = await requireAdmin()
  const { area } = await searchParams

  const known = AREAS.includes(area as Area) ? (area as Area) : null
  const base = `/${adminPath()}`

  return (
    <div className="max-w-[560px]">
      <div className="eyebrow text-gold-muted">Not available to you</div>
      <h1 className="mt-2 mb-0 font-serif text-[28px] font-normal">
        {known ? AREA_LABELS[known].label : 'That part of the panel'}
      </h1>
      <div className="rule-double mt-5 mb-6" />

      <p className="m-0 text-[14.5px] leading-[1.8] text-body">
        You are signed in as <strong className="text-ink">{admin.email}</strong>, with the{' '}
        {ROLE_LABELS[admin.role].toLowerCase()} role. That role does not open{' '}
        {known ? AREA_LABELS[known].label.toLowerCase() : 'this page'}.
      </p>

      <p className="mt-4 mb-0 text-[14.5px] leading-[1.8] text-body">
        If you need it, ask an administrator. They can change what each role reaches from the people
        page.
      </p>

      <Link href={base} className="btn-base btn-maroon mt-7">
        Back to the panel
      </Link>
    </div>
  )
}
