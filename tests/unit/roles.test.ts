import { describe, expect, it } from 'vitest'
import type { EditorialRole } from '@/lib/content'
import { roleStatusDisplay } from '@/lib/roles'

function role(overrides: Partial<EditorialRole> = {}): EditorialRole {
  return {
    title: 'Section Editor, Humanities',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees history, literature, philosophy, and the arts.',
    sortOrder: 5,
    ...overrides,
  }
}

describe('roleStatusDisplay', () => {
  it('gives each status its own colour', () => {
    expect(roleStatusDisplay(role({ status: 'pending' })).colour).toBe('#8A7B5C')
    expect(roleStatusDisplay(role({ status: 'recruiting' })).colour).toBe('#5D1D21')
    expect(roleStatusDisplay(role({ status: 'appointed' })).colour).toBe('#241F1E')
  })

  it('shows the name of whoever holds an appointed role', () => {
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: 'Jane Doe' })).holderName).toBe(
      'Jane Doe',
    )
  })

  it('hides a name left behind on a role that is no longer appointed', () => {
    // Un-appointing someone is one dropdown change in the admin. It must not
    // take a second edit to clear the name, or a stale name leaks to the site.
    expect(
      roleStatusDisplay(role({ status: 'recruiting', holderName: 'Jane Doe' })).holderName,
    ).toBeNull()
    expect(
      roleStatusDisplay(role({ status: 'pending', holderName: 'Jane Doe' })).holderName,
    ).toBeNull()
  })

  it('treats an empty name as no name', () => {
    // The admin panel's coerce() writes '' for an empty text field, not null,
    // so a null check alone would render a separator with nothing after it.
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: null })).holderName).toBeNull()
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: '' })).holderName).toBeNull()
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: '   ' })).holderName).toBeNull()
  })

  it('trims a name that was typed with stray spaces', () => {
    expect(
      roleStatusDisplay(role({ status: 'appointed', holderName: '  Jane Doe  ' })).holderName,
    ).toBe('Jane Doe')
  })
})
