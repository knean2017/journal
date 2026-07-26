import 'server-only'

import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { Choice } from '@/components/admin/FieldInput'

/** Foreign-key dropdown options, read with the service key so drafts appear too. */
export async function loadLookups(): Promise<{ disciplines: Choice[]; issues: Choice[] }> {
  const supabase = createSupabaseServiceClient()

  const [disciplines, issues] = await Promise.all([
    supabase.from('disciplines').select('id, name').order('sort_order'),
    supabase.from('issues').select('id, volume, number').order('volume', { ascending: false }),
  ])

  return {
    disciplines: (disciplines.data ?? []).map((row) => ({ value: row.id, label: row.name })),
    issues: (issues.data ?? []).map((row) => ({
      value: row.id,
      label: `Volume ${row.volume}, Issue ${row.number}`,
    })),
  }
}
