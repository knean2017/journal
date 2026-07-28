import { describe, expect, it } from 'vitest'
import { editorApplicationSchema } from '@/lib/inbox/schema'

const COMPLETE = {
  name: 'Ada Lovelace',
  email: 'ada@university.edu',
  affiliation: 'University of London',
  position: 'Lecturer',
  role: 'Section Editor, Natural Sciences',
  statement: 'I have run a section like this one before and want to do it here.',
  experience: '',
  orcid: '',
}

/** The message for a field, or undefined when the field was accepted. */
function errorOn(field: string, input: Record<string, unknown>): string | undefined {
  const parsed = editorApplicationSchema.safeParse(input)
  if (parsed.success) return undefined
  return parsed.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('editorApplicationSchema', () => {
  it('accepts a complete application', () => {
    expect(editorApplicationSchema.safeParse(COMPLETE).success).toBe(true)
  })

  it('treats experience and ORCID as optional', () => {
    const parsed = editorApplicationSchema.parse({
      ...COMPLETE,
      experience: undefined,
      orcid: undefined,
    })
    expect(parsed.experience).toBe('')
    expect(parsed.orcid).toBe('')
  })

  /**
   * An unchosen select posts nothing, which `text()` turns into an empty
   * string. That has to read as "choose a role", not as a type error.
   */
  it('asks for a role when the select was never touched', () => {
    expect(errorOn('role', { ...COMPLETE, role: '' })).toBe('Please choose a role.')
  })

  it('asks for a statement long enough to say something', () => {
    expect(errorOn('statement', { ...COMPLETE, statement: 'Want it.' })).toBe(
      'Please say why you want this role.',
    )
    expect(errorOn('statement', { ...COMPLETE, statement: 'x'.repeat(601) })).toBe(
      'Please keep this under 600 characters.',
    )
  })

  it('names each rejected identity field separately', () => {
    expect(errorOn('name', { ...COMPLETE, name: 'A' })).toBe('Please give your full name.')
    expect(errorOn('email', { ...COMPLETE, email: 'not-an-address' })).toBe(
      'That email address does not look right.',
    )
    expect(errorOn('affiliation', { ...COMPLETE, affiliation: '' })).toBe(
      'Please give your institution.',
    )
    expect(errorOn('position', { ...COMPLETE, position: '' })).toBe(
      'Please give your current position.',
    )
  })

  it('trims before measuring, so spaces do not pass for an answer', () => {
    expect(errorOn('name', { ...COMPLETE, name: '   ' })).toBe('Please give your full name.')
  })
})
