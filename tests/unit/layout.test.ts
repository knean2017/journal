import { describe, expect, it } from 'vitest'
import { balancedColumns } from '@/lib/layout'

describe('balancedColumns', () => {
  it('keeps everything on one row up to the maximum', () => {
    expect([1, 2, 3, 4, 5].map((n) => balancedColumns(n, 5))).toEqual([1, 2, 3, 4, 5])
  })

  it('splits an overflowing count into equal rows', () => {
    expect(balancedColumns(6, 5)).toBe(3)
    expect(balancedColumns(8, 5)).toBe(4)
    expect(balancedColumns(9, 5)).toBe(3)
    expect(balancedColumns(10, 5)).toBe(5)
    expect(balancedColumns(12, 5)).toBe(4)
  })

  it('leaves the shortest possible gap when no split is even', () => {
    expect(balancedColumns(7, 5)).toBe(4)
    expect(balancedColumns(11, 5)).toBe(4)
  })

  it('never returns a zero column count for an empty list', () => {
    expect(balancedColumns(0, 5)).toBe(1)
  })

  it('honours a lower maximum for narrower screens', () => {
    expect(balancedColumns(5, 3)).toBe(3)
    expect(balancedColumns(6, 3)).toBe(3)
    expect(balancedColumns(8, 3)).toBe(2)
  })
})
