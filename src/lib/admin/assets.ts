import { SUPABASE_URL } from '@/lib/supabase/env'

/**
 * A stored path turned back into something the browser can show.
 *
 * Both buckets this covers are public, so the URL needs no signing. Manuscripts
 * are not among them: those are private and go through signManuscript.
 */
export function assetUrl(path: string, kind: 'image' | 'pdf'): string {
  const bucket = kind === 'pdf' ? 'article-pdfs' : 'media'
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
