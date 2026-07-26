export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * True once the public Supabase credentials are present.
 *
 * Until then the content layer falls back to the seed files, so the site
 * builds, renders, and deploys with no database attached.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Server-only. Never import this into a client component. */
export function serviceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return key
}

/** The admin panel's public path. Everything under it requires a session. */
export function adminPath(): string {
  return (process.env.ADMIN_PATH ?? 'editorial-office').replace(/^\/+|\/+$/g, '')
}
