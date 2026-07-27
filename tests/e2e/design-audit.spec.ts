import { expect, test } from '@playwright/test'

const ROUTES = [
  '/',
  '/about',
  '/issue/current',
  '/archives',
  '/authors',
  '/authors/priya-nair',
  '/team',
  '/submit',
  '/news',
  '/contact',
  '/reviewers/apply',
  '/articles/canopy-cover-and-summer-surface-temperature',
]

for (const route of ROUTES) {
  test(`${route} renders with square corners`, async ({ page }) => {
    await page.goto(route)
    // Two elements are round by design: the announcement dot and the timeline rail dots.
    const rounded = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('*')).filter((el) => {
          const radius = getComputedStyle(el).borderRadius
          return radius !== '0px' && radius !== '' && !radius.startsWith('0')
        }).length,
    )
    expect(rounded).toBeLessThanOrEqual(6)
  })

  test(`${route} never scrolls horizontally at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(route)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })

  test(`${route} has exactly one h1`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test(`${route} renders no em dash`, async ({ page }) => {
    await page.goto(route)
    const text = (await page.locator('body').textContent()) ?? ''
    expect(text).not.toContain('—')
  })
}
