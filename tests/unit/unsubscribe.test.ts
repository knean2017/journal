import { describe, expect, it } from 'vitest'
import { unsubscribeTokenSchema, unsubscribeUrl } from '@/lib/subscribers/unsubscribe'

describe('the unsubscribe token', () => {
  const TOKEN = '6f1b9d3e-9c2a-4f57-9a1e-2b0c7d8e5f41'

  it('accepts a uuid', () => {
    expect(unsubscribeTokenSchema.safeParse(TOKEN).success).toBe(true)
  })

  it('tolerates the whitespace a mail client adds when a link wraps', () => {
    const parsed = unsubscribeTokenSchema.safeParse(`  ${TOKEN}\n`)
    expect(parsed.success && parsed.data).toBe(TOKEN)
  })

  it.each([
    ['nothing at all', ''],
    ['a truncated token', '6f1b9d3e-9c2a-4f57-9a1e'],
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
  const TOKEN = '6f1b9d3e-9c2a-4f57-9a1e-2b0c7d8e5f41'

  it('builds an absolute link the token round-trips through', () => {
    const url = new URL(unsubscribeUrl('https://icrrjournal.com', TOKEN))
    expect(url.pathname).toBe('/unsubscribe')
    expect(url.searchParams.get('token')).toBe(TOKEN)
  })

  it('does not double the slash when the site URL carries one', () => {
    expect(unsubscribeUrl('https://icrrjournal.com/', TOKEN)).toContain('.com/unsubscribe?')
  })
})
