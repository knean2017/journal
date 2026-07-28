import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/**
 * The anon client the public pages read through. Deliberately cookieless.
 *
 * `createSupabaseServerClient` binds to the request's cookies, and a single
 * `cookies()` call marks the whole route dynamic. Reading content through it
 * meant every public page was server-rendered on every visit and re-queried
 * the database each time, because nothing on those pages varies by visitor:
 * the journal shows one thing to everybody. Reading without cookies lets the
 * pages prerender.
 *
 * Nothing is lost by dropping the session. RLS gives the anon role published
 * rows and nothing else, which is exactly what the public site should show,
 * and a signed-in editor looking at the public site should see the public
 * site.
 *
 * One client per process, built on first use. Building it at module scope
 * would throw on a deployment with no Supabase credentials, where the content
 * layer is meant to fall back to the seed files instead.
 */
let client: SupabaseClient | null = null

export function createSupabasePublicClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}
