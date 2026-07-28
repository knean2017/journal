import { SettingsForm } from '@/components/admin/SettingsForm'
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
        These values appear across the whole site. Dates are written out in words rather than
        picked from a calendar, so they read the way the journal writes them, for example
        &ldquo;31 August 2026&rdquo;.
      </p>

      <SettingsForm fields={SITE_CONFIG_FIELDS} record={data ?? null} />
    </>
  )
}
