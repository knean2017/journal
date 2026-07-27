import { expect, test } from '@playwright/test'

test.describe('desktop nav', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('shows the six primary links and the Submit pill', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Our Team' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Submit' })).toBeVisible()
    await expect(nav.getByRole('button', { name: /menu/i })).toHaveCount(0)
  })

  test('marks the active page with the gold underline', async ({ page }) => {
    await page.goto('/about')
    const link = page.locator('nav').first().getByRole('link', { name: 'About' })
    await expect(link).toHaveCSS('border-bottom-color', 'rgb(192, 162, 101)')
  })

  test('keeps Authors active on an author profile', async ({ page }) => {
    await page.goto('/authors/priya-nair')
    const link = page.locator('nav').first().getByRole('link', { name: 'Authors' })
    await expect(link).toHaveCSS('border-bottom-color', 'rgb(192, 162, 101)')
  })

  test('inactive links keep a transparent border so nothing shifts', async ({ page }) => {
    await page.goto('/about')
    const link = page.locator('nav').first().getByRole('link', { name: 'Archives' })
    await expect(link).toHaveCSS('border-bottom-width', '2px')
  })
})

test.describe('mobile nav and drawer', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('replaces the links with a Menu button and the page name', async ({ page }) => {
    await page.goto('/about')
    const nav = page.locator('nav').first()
    await expect(nav.getByRole('button', { name: /menu/i })).toBeVisible()
    await expect(nav.getByText('About', { exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Archives' })).toHaveCount(0)
  })

  test('opens the drawer, ignores inside clicks, closes on the scrim', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()

    const drawer = page.getByRole('complementary')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'Announcements' })).toBeVisible()

    await drawer.getByText('Navigation').click()
    await expect(drawer).toBeVisible()

    await page.mouse.click(20, 400)
    await expect(drawer).toHaveCount(0)
  })

  test('closes the drawer when a nav item is chosen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()
    await page.getByRole('complementary').getByRole('link', { name: 'Archives' }).click()
    await expect(page).toHaveURL(/\/archives$/)
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })

  test('resizing above 860px force-closes the drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()
    await expect(page.getByRole('complementary')).toBeVisible()

    await page.setViewportSize({ width: 1200, height: 900 })
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })
})

test('footer carries the contact address and the licence line', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByText('icrrjournal@gmail.com')).toBeVisible()
  await expect(footer.getByText(/CC BY 4\.0/)).toBeVisible()
})

test('top strip Contact opens the contact page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Contact' }).first().click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible()
})
