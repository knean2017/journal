import { FieldInput } from '@/components/admin/FieldInput'
import { saveSiteConfig } from '@/lib/admin/actions'
import { SITE_CONFIG_FIELDS } from '@/lib/admin/entities'
import { requireAdmin } from '@/lib/admin/session'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function SiteConfigPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data } = await supabase.from('site_config').select('*').maybeSingle()

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Site settings</h1>
      <div className="rule-double mt-5 mb-7" />

      <p className="mt-0 mb-7 text-[14px] leading-[1.75] text-body max-w-[70ch]">
        These values appear across the whole site. Dates are free text so they read the way the
        journal writes them, for example &ldquo;31 August 2026&rdquo;.
      </p>

      <form action={saveSiteConfig} className="grid gap-5 max-w-[720px]">
        {SITE_CONFIG_FIELDS.map((field) => (
          <FieldInput key={field.name} field={field} value={data?.[field.name] ?? null} />
        ))}

        <div className="pt-2">
          <button type="submit" className="btn-base btn-maroon">
            Save settings
          </button>
        </div>
      </form>
    </>
  )
}
