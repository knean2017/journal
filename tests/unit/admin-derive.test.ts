import { describe, expect, it } from 'vitest'
import {
  fillPattern,
  friendlyError,
  nextStatusLabel,
  reorder,
  slugify,
  standardLabel,
} from '@/lib/admin/derive'

const ISSUE_STATUSES = [
  { value: 'in_preparation', label: 'In preparation' },
  { value: 'published', label: 'Published' },
]

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('On the Analytical Engine')).toBe('on-the-analytical-engine')
  })

  it('folds accents to plain letters instead of dropping them', () => {
    expect(slugify('Läw & Policy')).toBe('law-policy')
    expect(slugify('Zoë Çelik')).toBe('zoe-celik')
  })

  it('collapses runs of punctuation and trims the ends', () => {
    expect(slugify('  ...Hello --- World!!  ')).toBe('hello-world')
  })

  it('is empty for a value with nothing usable in it', () => {
    expect(slugify('!!!')).toBe('')
    expect(slugify('')).toBe('')
  })
})

describe('fillPattern', () => {
  it('fills a single placeholder', () => {
    expect(fillPattern('{name}', { name: 'Priya Nair' })).toBe('priya-nair')
  })

  it('fills several, including numbers', () => {
    expect(fillPattern('volume-{volume}-issue-{number}', { volume: 1, number: 2 })).toBe(
      'volume-1-issue-2',
    )
  })

  /** Half-typed is the normal state of a form, not an error. */
  it('survives a source that is still empty', () => {
    expect(fillPattern('volume-{volume}-issue-{number}', { volume: '', number: 2 })).toBe(
      'volume-issue-2',
    )
    expect(fillPattern('{name}', {})).toBe('')
  })
})

describe('standardLabel', () => {
  it('reads the wording off the matching option', () => {
    expect(standardLabel(ISSUE_STATUSES, 'published')).toBe('Published')
  })

  it('is empty for a status with no option', () => {
    expect(standardLabel(ISSUE_STATUSES, 'retracted')).toBe('')
  })
})

describe('nextStatusLabel', () => {
  it('fills an empty wording from the new status', () => {
    expect(nextStatusLabel(ISSUE_STATUSES, '', 'in_preparation', 'published')).toBe('Published')
    expect(nextStatusLabel(ISSUE_STATUSES, '   ', 'in_preparation', 'published')).toBe('Published')
  })

  it('follows the status while the wording is still the standard one', () => {
    expect(nextStatusLabel(ISSUE_STATUSES, 'In preparation', 'in_preparation', 'published')).toBe(
      'Published',
    )
  })

  /**
   * Issue 2 ships as "In preparation" with the wording "Scheduled", which
   * somebody chose. Changing the status must not quietly undo that.
   */
  it('leaves wording that was written by hand alone', () => {
    expect(nextStatusLabel(ISSUE_STATUSES, 'Scheduled', 'in_preparation', 'published')).toBe(
      'Scheduled',
    )
  })
})

describe('friendlyError', () => {
  it('explains a clashing web address in terms of the form', () => {
    const message = friendlyError(
      'duplicate key value violates unique constraint "authors_slug_key"',
      'author',
    )
    expect(message).toContain('web address')
    expect(message).not.toContain('constraint')
  })

  it('names a different clashing column when it is not the address', () => {
    expect(
      friendlyError('duplicate key value violates unique constraint "authors_email_key"', 'author'),
    ).toBe('Another author already uses that email.')
  })

  it('turns a missing required column into plain words', () => {
    expect(
      friendlyError('null value in column "status_label" violates not-null constraint', 'issue'),
    ).toBe('status label cannot be left empty.')
  })

  it('passes an error it does not recognise through rather than inventing one', () => {
    expect(friendlyError('connection terminated unexpectedly', 'issue')).toBe(
      'Could not save: connection terminated unexpectedly',
    )
  })
})

describe('reorder', () => {
  const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('moves a row up and renumbers the list from one', () => {
    expect(reorder(rows, 'c', 'up')).toEqual([
      { id: 'a', sort_order: 1 },
      { id: 'c', sort_order: 2 },
      { id: 'b', sort_order: 3 },
    ])
  })

  it('moves a row down', () => {
    expect(reorder(rows, 'a', 'down')).toEqual([
      { id: 'b', sort_order: 1 },
      { id: 'a', sort_order: 2 },
      { id: 'c', sort_order: 3 },
    ])
  })

  /** The first row's up arrow and the last row's down arrow do nothing. */
  it('refuses to move off either end', () => {
    expect(reorder(rows, 'a', 'up')).toEqual([])
    expect(reorder(rows, 'c', 'down')).toEqual([])
  })

  it('ignores an id that is not in the list', () => {
    expect(reorder(rows, 'z', 'up')).toEqual([])
  })

  /**
   * Writing the whole list back in sequence is what repairs numbering that had
   * gone duplicate or gappy, which is why it renumbers rather than swapping.
   */
  it('renumbers every row, not just the pair that moved', () => {
    const four = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    expect(reorder(four, 'd', 'up').map((row) => row.sort_order)).toEqual([1, 2, 3, 4])
  })
})
