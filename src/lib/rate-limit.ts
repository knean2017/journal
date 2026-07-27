import 'server-only'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Per-key fixed-window limiter, held in memory.
 *
 * On a serverless host each instance keeps its own counters, so this blunts
 * casual abuse rather than guaranteeing a global ceiling. Move it to Postgres
 * or an edge KV if that stops being enough.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false

  bucket.count += 1
  return true
}

/** Best-effort client address from the proxy headers Netlify sets. */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get('x-nf-client-connection-ip') ?? headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0]?.trim() || 'unknown'
  return `${scope}:${ip}`
}
