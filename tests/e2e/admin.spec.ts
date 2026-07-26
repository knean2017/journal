import { expect, test } from '@playwright/test'

/**
 * The admin's internal route tree must never be addressable directly, whatever
 * ADMIN_PATH is set to, and whether or not Supabase is configured.
 */
const INTERNAL = ['/admin', '/admin/login', '/admin/config', '/admin/media', '/admin/submissions']

for (const route of INTERNAL) {
  test(`${route} is not addressable`, async ({ page }) => {
    const response = await page.goto(route)
    expect(response?.status()).toBe(404)
  })
}

test('the admin path never leaks into public markup', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('/admin')
  expect(html.toLowerCase()).not.toContain('editorial-office')
})

test('the service role key is never sent to the browser', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  expect(html).not.toContain('service_role')
})
