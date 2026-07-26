import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/styles/globals.css', 'utf8')

const COLORS: Record<string, string> = {
  maroon: '#5D1D21',
  'maroon-hover': '#7C2A2F',
  'maroon-deep': '#3F1417',
  gold: '#C0A265',
  'gold-muted': '#8A7B5C',
  cream: '#F7F4EF',
  'cream-tint': '#FBF7EE',
  page: '#FDFBF7',
  ink: '#241F1E',
  'ink-soft': '#3F3733',
  body: '#5A524A',
  'body-muted': '#6E655C',
  rule: '#E2DACB',
  'rule-light': '#EFE9DF',
}

describe('design tokens', () => {
  it.each(Object.entries(COLORS))('declares --color-%s as %s', (name, hex) => {
    expect(css).toMatch(new RegExp(`--color-${name}:\\s*${hex};`, 'i'))
  })

  it.each(['icrrUp', 'icrrIn', 'icrrDraw', 'icrrPlate', 'icrrPulse', 'icrrDrawer'])(
    'defines the %s keyframes',
    (name) => {
      expect(css).toContain(`@keyframes ${name}`)
    },
  )

  it('declares the one permitted shadow and no other', () => {
    const shadows = css.match(/box-shadow:[^;]+;/g) ?? []
    expect(shadows).toEqual(['box-shadow: 0 10px 30px rgba(36, 31, 30, 0.28);'])
  })

  it('resets border radius globally', () => {
    expect(css).toMatch(/border-radius:\s*0/)
  })
})
