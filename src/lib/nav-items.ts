export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/issue/current', label: 'Current Issue' },
  { href: '/archives', label: 'Archives' },
  { href: '/authors', label: 'Authors' },
  { href: '/team', label: 'Our Team' },
] as const

export const DRAWER_ITEMS = [...NAV_ITEMS, { href: '/news', label: 'Announcements' }] as const

export const PAGE_TITLES: Record<string, string> = {
  '/': '',
  '/about': 'About',
  '/issue/current': 'Current Issue',
  '/archives': 'Archives',
  '/authors': 'Authors',
  '/team': 'Our Team',
  '/submit': 'Submit',
  '/news': 'Announcements',
}

/** Authors stays highlighted on author profile pages. */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/') return pathname === '/'
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
}

export function pageTitleFor(pathname: string): string {
  if (PAGE_TITLES[pathname] !== undefined) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/authors/')) return 'Contributor'
  if (pathname.startsWith('/articles/')) return 'Article'
  return ''
}
