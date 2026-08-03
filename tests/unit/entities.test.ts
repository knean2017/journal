import { describe, expect, it } from 'vitest'
import { findEntity } from '@/lib/admin/entities'

describe('editorial roles entity', () => {
  it('offers appointed as a third status', () => {
    const status = findEntity('roles')?.fields.find((f) => f.name === 'status')
    expect(status?.options?.map((o) => o.value)).toEqual(['recruiting', 'pending', 'appointed'])
    expect(status?.options?.find((o) => o.value === 'appointed')?.label).toBe('Appointed')
  })

  it('has somewhere to put the holder name, not required', () => {
    const holder = findEntity('roles')?.fields.find((f) => f.name === 'holder_name')
    expect(holder).toBeDefined()
    expect(holder?.type).toBe('text')
    // Six of the seven roles have no holder. Requiring it would block every
    // ordinary edit to a role that is still recruiting.
    expect(holder?.required).toBeUndefined()
  })

  it('keeps status_label following the status select', () => {
    const label = findEntity('roles')?.fields.find((f) => f.name === 'status_label')
    expect(label?.followsStatus).toBe('status')
  })
})
