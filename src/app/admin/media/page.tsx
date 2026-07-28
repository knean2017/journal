import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { requireAdmin } from '@/lib/admin/session'
import { SUPABASE_URL } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.storage
    .from('media')
    .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })

  const files = (data ?? [])
    .filter((file) => file.name !== '.emptyFolderPlaceholder')
    .map((file) => ({
      name: file.name,
      url: `${SUPABASE_URL}/storage/v1/object/public/media/${file.name}`,
    }))

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Media</h1>
      <div className="rule-double mt-5 mb-7" />

      <p className="mt-0 mb-7 text-[14px] leading-[1.75] text-body max-w-[70ch]">
        Every picture on the site lives here. You do not have to use this page to add one: each
        photo and cover field uploads its own. This is where you come to see what is already
        uploaded, or to delete something for good.
      </p>

      {error ? (
        <p className="text-[14px] text-maroon">Could not list the bucket: {error.message}</p>
      ) : (
        <MediaLibrary files={files} />
      )}
    </>
  )
}
