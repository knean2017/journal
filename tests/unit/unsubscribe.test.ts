import { describe, expect, it } from 'vitest'
import { unsubscribeTokenSchema, unsubscribeUrl } from '@/lib/subscribers/unsubscribe'

/*
 * Deliberately a counting pattern rather than random-looking hex.
 *
 * A realistic v4 uuid here reads as a high-entropy string to a secret scanner,
 * and this fixture tripped one. Nothing is lost by making it obviously
 * synthetic: the schema checks the shape, not the randomness. The version and
 * variant nibbles are still 4 and 8, so it is a well-formed v4 uuid.
 */
const TOKEN = '00000000-0000-4000-8000-000000000001'

describe('the unsubscribe token', () => {
  it('accepts a uuid', () => {
    expect(unsubscribeTokenSchema.safeParse(TOKEN).success).toBe(true)
  })

  it('tolerates the whitespace a mail client adds when a link wraps', () => {
    const parsed = unsubscribeTokenSchema.safeParse(`  ${TOKEN}\n`)
    expect(parsed.success && parsed.data).toBe(TOKEN)
  })

  it.each([
    ['nothing at all', ''],
    ['a truncated token', '00000000-0000-4000-8000'],
    ['an email address', 'reader@example.com'],
    ['a number', '12345'],
    // Refused here rather than at the database, which would raise on a uuid
    // comparison against text it cannot cast.
    ['an injection attempt', "' or is_active = true --"],
  ])('refuses %s', (_label, value) => {
    expect(unsubscribeTokenSchema.safeParse(value).success).toBe(false)
  })
})

describe('unsubscribeUrl', () => {
  it('builds an absolute link the token round-trips through', () => {
    const url = new URL(unsubscribeUrl('https://icrrjournal.com', TOKEN))
    expect(url.pathname).toBe('/unsubscribe')
    expect(url.searchParams.get('token')).toBe(TOKEN)
  })

  it('does not double the slash when the site URL carries one', () => {
    expect(unsubscribeUrl('https://icrrjournal.com/', TOKEN)).toContain('.com/unsubscribe?')
  })
})
