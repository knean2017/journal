import { describe, expect, it } from 'vitest'
import { isNavItemActive, pageTitleFor } from '@/lib/nav-items'

describe('isNavItemActive', () => {
  it('matches home only exactly', () => {
    expect(isNavItemActive('/', '/')).toBe(true)
    expect(isNavItemActive('/', '/about')).toBe(false)
  })

  it('keeps Authors active on an author profile', () => {
    expect(isNavItemActive('/authors', '/authors/priya-nair')).toBe(true)
  })

  it('does not activate About on an unrelated route', () => {
    expect(isNavItemActive('/about', '/archives')).toBe(false)
  })
})

describe('pageTitleFor', () => {
  it('is empty on home', () => {
    expect(pageTitleFor('/')).toBe('')
  })

  it('names known routes', () => {
    expect(pageTitleFor('/team')).toBe('Our Team')
  })

  it('names an author profile "Contributor"', () => {
    expect(pageTitleFor('/authors/priya-nair')).toBe('Contributor')
  })

  it('names an article page "Article"', () => {
    expect(pageTitleFor('/articles/anything')).toBe('Article')
  })
})
