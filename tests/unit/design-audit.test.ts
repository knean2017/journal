import { readFileSync } from 'node:fs'
import fg from 'fast-glob'
import { describe, expect, it } from 'vitest'

const FILES = fg.sync('src/**/*.{ts,tsx,css}')
const read = (file: string) => readFileSync(file, 'utf8')

const ALLOWED_HEX = new Set([
  '#5D1D21',
  '#7C2A2F',
  '#3F1417',
  '#C0A265',
  '#8A7B5C',
  '#F7F4EF',
  '#FBF7EE',
  '#FDFBF7',
  '#241F1E',
  '#3F3733',
  '#5A524A',
  '#6E655C',
  '#E2DACB',
  '#EFE9DF',
  // Gold button hover. Permitted once, in .btn-gold:hover.
  '#D2B67E',
])

/**
 * Two elements are round by design, both from the prototype: the pulsing
 * announcement dot and the production-timeline rail dots.
 */
const ROUND_BY_DESIGN = [
  'src/components/site/home/AnnouncementBar.tsx',
  'src/components/site/issue/ProductionTimeline.tsx',
]

describe('design audit', () => {
  it('uses no hex colour outside the palette', () => {
    const offenders: string[] = []
    for (const file of FILES) {
      for (const hex of read(file).match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
        if (!ALLOWED_HEX.has(hex.toUpperCase())) offenders.push(`${file}: ${hex}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('declares no non-zero border radius outside the two round-by-design elements', () => {
    const offenders: string[] = []

    for (const file of FILES) {
      const path = file.replace(/\\/g, '/')
      if (ROUND_BY_DESIGN.includes(path)) continue
      const source = read(file)

      // Tailwind's rounding utilities, in any form.
      if (/\brounded(-[a-z0-9[\]]+)?\b/.test(source)) offenders.push(`${path}: rounded utility`)

      // Explicit declarations, ignoring the ones that zero it out.
      for (const [, value] of source.matchAll(/border-?[Rr]adius:\s*['"]?([^;'"}\n]+)/g)) {
        if (!/^0[a-z%]*$/i.test(value.trim())) offenders.push(`${path}: ${value.trim()}`)
      }
    }

    expect(offenders).toEqual([])
  })

  it('declares exactly one box shadow across the codebase', () => {
    const found = FILES.flatMap((file) =>
      (read(file).match(/box-?[Ss]hadow/g) ?? []).map(() => file.replace(/\\/g, '/')),
    )
    expect(found).toEqual(['src/styles/globals.css'])
  })

  it('contains no em dash in any source file', () => {
    const offenders = FILES.filter((file) => read(file).includes('—'))
    expect(offenders).toEqual([])
  })

  it('never says Editorial Board', () => {
    const offenders = FILES.filter((file) => read(file).includes('Editorial Board'))
    expect(offenders).toEqual([])
  })

  it('never promises written feedback to authors', () => {
    const offenders = FILES.filter((file) => /written feedback/i.test(read(file)))
    expect(offenders).toEqual([])
  })
})
