import { expect, test } from '@playwright/test'

test.describe('reviewer panel', () => {
  test('the team page button navigates instead of toasting', async ({ page }) => {
    await page.goto('/team')
    await page.getByRole('link', { name: 'Apply as a reviewer' }).click()
    await expect(page).toHaveURL(/\/reviewers\/apply$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Join the reviewer panel')
  })

  test('the form carries every field an application needs', async ({ page }) => {
    await page.goto('/reviewers/apply')
    const form = page.locator('form')
    for (const name of ['name', 'email', 'affiliation', 'position', 'expertise']) {
      await expect(form.locator(`[name="${name}"]`)).toBeVisible()
    }
    await expect(form.getByRole('combobox').locator('option')).toHaveCount(6)
    await expect(page.getByRole('button', { name: 'Send application' })).toBeVisible()
  })

  test('an empty application is refused and says why', async ({ page }) => {
    await page.goto('/reviewers/apply')
    await page.getByRole('button', { name: 'Send application' }).click()
    await expect(page.getByRole('status')).toBeVisible()
    await expect(page.getByText('Please give your full name.')).toBeVisible()
  })
})

test.describe('contact', () => {
  test('the top strip link opens the contact page, not the about page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Contact' }).first().click()
    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('editorial office')
  })

  /**
   * The email box is type="email", so a malformed address never reaches the
   * server: the browser blocks the submit. Leaving it blank is the way through
   * to the server's own validation, which is what this asserts.
   */
  test('an incomplete message is refused per field', async ({ page }) => {
    await page.goto('/contact')
    await page.locator('[name="name"]').fill('Ada Lovelace')
    await page.locator('[name="message"]').fill('Short')
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.getByText('That email address does not look right.')).toBeVisible()
    await expect(page.getByText('Please say a little more so we can answer properly.')).toBeVisible()
  })

  test('routes a manuscript to the submission form instead', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('link', { name: 'submission form' }).click()
    await expect(page).toHaveURL(/\/submit$/)
  })
})

test.describe('manuscript attachment', () => {
  const FILE = {
    name: 'anonymised-manuscript.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  }

  test('names the attached file and can remove it again', async ({ page }) => {
    await page.goto('/submit')
    const input = page.locator('input[name="manuscript"]')

    await expect(page.getByText('Choose file')).toBeVisible()

    await input.setInputFiles(FILE)
    await expect(page.getByText(FILE.name)).toBeVisible()
    await expect(page.getByText('Choose file')).toHaveCount(0)

    await page.getByRole('button', { name: `Remove ${FILE.name}` }).click()

    await expect(page.getByText(FILE.name)).toHaveCount(0)
    await expect(page.getByText('Choose file')).toBeVisible()
  })

  test('removing the file really empties the input, not just the label', async ({ page }) => {
    await page.goto('/submit')
    const input = page.locator('input[name="manuscript"]')

    await input.setInputFiles(FILE)
    await page.getByRole('button', { name: `Remove ${FILE.name}` }).click()

    const count = await input.evaluate((el) => (el as HTMLInputElement).files?.length ?? -1)
    expect(count).toBe(0)
  })
})
