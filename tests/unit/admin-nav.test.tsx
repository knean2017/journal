import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminNav, type NavGroup } from '@/components/admin/AdminNav'
import { matchesQuery, matchesStatus, param } from '@/lib/admin/filter'

/** The sign-out action is a 'use server' module that cannot load under jsdom. */
vi.mock('@/lib/admin/actions', () => ({ signOut: vi.fn(async () => undefined) }))

const pathname = vi.fn(() => '/editorial-office/articles')
vi.mock('next/navigation', () => ({ usePathname: () => pathname() }))

const GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    links: [{ href: '/editorial-office', label: 'Dashboard', exact: true }],
  },
  {
    title: 'Inbox',
    links: [
      { href: '/editorial-office/submissions', label: 'Submissions', count: 3 },
      { href: '/editorial-office/messages', label: 'Messages', count: 0 },
    ],
  },
  {
    title: 'Website content',
    links: [{ href: '/editorial-office/articles', label: 'Articles' }],
  },
]

describe('admin navigation', () => {
  it('marks the page you are on, and only that one', () => {
    render(<AdminNav groups={GROUPS} email="editor@icrrjournal.com" />)

    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Articles')
  })

  it('marks a record page as its list', () => {
    pathname.mockReturnValueOnce('/editorial-office/articles/17')
    render(<AdminNav groups={GROUPS} email="editor@icrrjournal.com" />)

    expect(screen.getAllByRole('link', { current: 'page' })[0]).toHaveTextContent('Articles')
  })

  it('does not mark the dashboard on every page beneath it', () => {
    render(<AdminNav groups={GROUPS} email="editor@icrrjournal.com" />)

    const dashboard = screen.getAllByRole('link', { name: /Dashboard/ })[0]
    expect(dashboard).not.toHaveAttribute('aria-current')
  })

  it('badges an inbox that has something waiting, and leaves an empty one bare', () => {
    render(<AdminNav groups={GROUPS} email="editor@icrrjournal.com" />)

    const submissions = screen.getAllByRole('link', { name: /Submissions/ })[0]
    expect(within(submissions).getByLabelText('3 new')).toHaveTextContent('3')

    const messages = screen.getAllByRole('link', { name: /Messages/ })[0]
    expect(within(messages).queryByLabelText(/new/)).toBeNull()
  })
})

describe('list filters', () => {
  it('matches any column a list shows, whatever the case', () => {
    expect(matchesQuery('canopy', ['Canopy cover and surface temperature', null])).toBe(true)
    expect(matchesQuery('  LEEDS ', [null, 'University of Leeds'])).toBe(true)
    expect(matchesQuery('canopy', ['Microloan repayment'])).toBe(false)
  })

  it('treats an empty search as no search at all', () => {
    expect(matchesQuery('', [null, undefined])).toBe(true)
  })

  it('treats an empty status as every status', () => {
    expect(matchesStatus('', 'archived')).toBe(true)
    expect(matchesStatus('new', 'new')).toBe(true)
    expect(matchesStatus('new', 'archived')).toBe(false)
  })

  it('reads a query string that arrives once, twice, or not at all', () => {
    expect(param('canopy')).toBe('canopy')
    expect(param(['canopy', 'ignored'])).toBe('canopy')
    expect(param(undefined)).toBe('')
  })
})
