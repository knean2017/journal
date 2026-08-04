import { describe, expect, it } from 'vitest'
import {
  AREAS,
  AREA_PATHS,
  DEFAULT_MATRIX,
  STAFF_ROLES,
  areaForEntity,
  areaForInbox,
  can,
  firstAllowedArea,
  levelFor,
  withDefaults,
  type PermissionMatrix,
} from '@/lib/admin/permissions'
import { ENTITIES } from '@/lib/admin/entities'
import { INBOX_TABLES } from '@/lib/admin/entities'

describe('the default matrix', () => {
  it('covers every role and every area', () => {
    for (const role of STAFF_ROLES) {
      for (const area of AREAS) {
        expect(DEFAULT_MATRIX[role][area], `${role} / ${area}`).toBeDefined()
      }
    }
  })

  it('matches the agreed matrix', () => {
    expect(DEFAULT_MATRIX.editor.settings).toBe('none')
    expect(DEFAULT_MATRIX.editor['content.journal']).toBe('edit')
    expect(DEFAULT_MATRIX.content_manager['content.journal']).toBe('none')
    expect(DEFAULT_MATRIX.content_manager['content.outreach']).toBe('edit')
    expect(DEFAULT_MATRIX.reviewer.submissions).toBe('edit')
    expect(DEFAULT_MATRIX.reviewer.messages).toBe('none')
    expect(DEFAULT_MATRIX.observer.settings).toBe('view')
    expect(DEFAULT_MATRIX.observer.people).toBe('none')
  })

  it('gives nobody but the administrator the people area', () => {
    for (const role of STAFF_ROLES) {
      if (role === 'administrator') continue
      expect(DEFAULT_MATRIX[role].people, role).toBe('none')
    }
  })

  it('lets nobody but the administrator edit the announcement list', () => {
    // The list is built from consent given on the public site and withdrawn
    // through the unsubscribe link. No role needs to write to it, and a role
    // that could would be a way onto a mailing list nobody asked to be on.
    for (const role of STAFF_ROLES) {
      if (role === 'administrator') continue
      expect(DEFAULT_MATRIX[role].subscribers, role).not.toBe('edit')
    }
  })

  it('shows the announcement list to the role that writes announcements', () => {
    expect(DEFAULT_MATRIX.content_manager.subscribers).toBe('view')
    expect(DEFAULT_MATRIX.editor.subscribers).toBe('view')
    expect(DEFAULT_MATRIX.reviewer.subscribers).toBe('none')
  })

  it('lets only the editor and the administrator mail the list', () => {
    // Sending cannot be undone, so the role that writes the announcements is
    // deliberately not the role that can put them in thousands of inboxes.
    expect(DEFAULT_MATRIX.editor.announcement_sends).toBe('edit')
    expect(DEFAULT_MATRIX.content_manager.announcement_sends).toBe('view')
    expect(DEFAULT_MATRIX.observer.announcement_sends).toBe('view')
    expect(DEFAULT_MATRIX.reviewer.announcement_sends).toBe('none')
  })
})

describe('levelFor', () => {
  it('reads the level out of the matrix', () => {
    expect(levelFor(DEFAULT_MATRIX, 'editor', 'settings')).toBe('none')
    expect(levelFor(DEFAULT_MATRIX, 'observer', 'media')).toBe('view')
  })

  it('never lets an administrator be reduced, whatever the matrix says', () => {
    // The lockout guard. If the grid could strip the administrator's access to
    // the people area, whoever saved that grid would lock everybody out of the
    // panel permanently, with no way back in through the UI.
    const sabotaged = {
      ...DEFAULT_MATRIX,
      administrator: Object.fromEntries(AREAS.map((a) => [a, 'none'])),
    } as PermissionMatrix

    for (const area of AREAS) {
      expect(levelFor(sabotaged, 'administrator', area), area).toBe('edit')
    }
  })
})

describe('can', () => {
  it('treats edit as covering view', () => {
    expect(can(DEFAULT_MATRIX, 'editor', 'content.journal', 'view')).toBe(true)
    expect(can(DEFAULT_MATRIX, 'editor', 'content.journal', 'edit')).toBe(true)
  })

  it('lets an observer look without touching', () => {
    expect(can(DEFAULT_MATRIX, 'observer', 'content.journal', 'view')).toBe(true)
    expect(can(DEFAULT_MATRIX, 'observer', 'content.journal', 'edit')).toBe(false)
  })

  it('refuses an area set to none', () => {
    expect(can(DEFAULT_MATRIX, 'reviewer', 'settings', 'view')).toBe(false)
    expect(can(DEFAULT_MATRIX, 'reviewer', 'settings', 'edit')).toBe(false)
  })

  it('keeps a reviewer inside submissions', () => {
    expect(can(DEFAULT_MATRIX, 'reviewer', 'submissions', 'edit')).toBe(true)
    for (const area of AREAS) {
      if (area === 'submissions') continue
      expect(can(DEFAULT_MATRIX, 'reviewer', area, 'view'), area).toBe(false)
    }
  })
})

describe('area lookups', () => {
  it('maps every admin entity to an area', () => {
    // A new entity with no area would fall through the gate entirely, so this
    // fails the moment one is added to ENTITIES without a mapping.
    for (const entity of ENTITIES) {
      expect(areaForEntity(entity.slug), entity.slug).not.toBeNull()
    }
  })

  it('maps every inbox to an area', () => {
    for (const key of Object.keys(INBOX_TABLES)) {
      expect(areaForInbox(key), key).not.toBeNull()
    }
  })

  it('separates journal content from outreach', () => {
    expect(areaForEntity('articles')).toBe('content.journal')
    expect(areaForEntity('issues')).toBe('content.journal')
    expect(areaForEntity('announcements')).toBe('content.outreach')
    expect(areaForEntity('ticker')).toBe('content.outreach')
    expect(areaForEntity('team')).toBe('content.people')
    expect(areaForEntity('roles')).toBe('content.people')
  })

  it('returns null for something that is not an entity', () => {
    expect(areaForEntity('nonsense')).toBeNull()
  })
})

describe('AREA_PATHS', () => {
  it('gives every area somewhere to land', () => {
    // firstAllowedArea returns an area and the dashboard redirects to its path.
    // An area with no path would redirect to the panel root, which is the very
    // page the redirect exists to avoid, and that loops.
    for (const area of AREAS) {
      expect(AREA_PATHS[area], area).toBeDefined()
    }
  })

  it('points the dashboard at the panel root and nothing else there', () => {
    expect(AREA_PATHS.dashboard).toBe('')
    const roots = AREAS.filter((area) => AREA_PATHS[area] === '')
    expect(roots).toEqual(['dashboard'])
  })
})

describe('firstAllowedArea', () => {
  it('sends a reviewer to submissions, since the dashboard is closed to them', () => {
    expect(firstAllowedArea(DEFAULT_MATRIX, 'reviewer')).toBe('submissions')
  })

  it('sends everyone else to the dashboard', () => {
    expect(firstAllowedArea(DEFAULT_MATRIX, 'editor')).toBe('dashboard')
    expect(firstAllowedArea(DEFAULT_MATRIX, 'content_manager')).toBe('dashboard')
    expect(firstAllowedArea(DEFAULT_MATRIX, 'observer')).toBe('dashboard')
  })

  it('returns null when a role has been stripped of everything', () => {
    const shutOut = {
      ...DEFAULT_MATRIX,
      observer: Object.fromEntries(AREAS.map((a) => [a, 'none'])),
    } as PermissionMatrix
    expect(firstAllowedArea(shutOut, 'observer')).toBeNull()
  })
})

describe('withDefaults', () => {
  it('fills in areas the database has no row for', () => {
    // Adding an area in code must not silently grant it: a missing row reads as
    // whatever the default matrix says, not as edit.
    const partial = { editor: { submissions: 'view' } }
    const merged = withDefaults(partial)

    expect(merged.editor.submissions).toBe('view')
    expect(merged.editor.settings).toBe(DEFAULT_MATRIX.editor.settings)
    expect(merged.reviewer.submissions).toBe(DEFAULT_MATRIX.reviewer.submissions)
  })

  it('ignores roles and areas it does not recognise', () => {
    const junk = { sorcerer: { submissions: 'edit' }, editor: { atlantis: 'edit' } }
    const merged = withDefaults(junk)

    expect(merged).not.toHaveProperty('sorcerer')
    expect(merged.editor).not.toHaveProperty('atlantis')
  })
})
