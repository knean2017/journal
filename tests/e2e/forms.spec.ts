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

test.describe('editorial roles', () => {
  test('the team page button navigates instead of toasting', async ({ page }) => {
    await page.goto('/team')
    await page.getByRole('link', { name: 'Apply as an editor' }).click()
    await expect(page).toHaveURL(/\/editors\/apply$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Join the editorial board')
  })

  /**
   * Six recruiting roles plus the disabled placeholder. The seventh seeded
   * role has an appointment pending, so it must not be on offer here.
   */
  test('offers only the roles being recruited', async ({ page }) => {
    await page.goto('/editors/apply')
    const roles = page.locator('form').getByRole('combobox')
    await expect(roles.locator('option')).toHaveCount(7)
    await expect(roles.locator('option', { hasText: 'Managing Editor' })).toHaveCount(0)
  })

  test('the form carries every field an application needs', async ({ page }) => {
    await page.goto('/editors/apply')
    const form = page.locator('form')
    for (const name of ['name', 'email', 'affiliation', 'position', 'role', 'statement']) {
      await expect(form.locator(`[name="${name}"]`)).toBeVisible()
    }
    await expect(page.getByRole('button', { name: 'Send application' })).toBeVisible()
  })

  test('an empty application is refused and says why', async ({ page }) => {
    await page.goto('/editors/apply')
    await page.getByRole('button', { name: 'Send application' }).click()
    await expect(page.getByRole('status')).toBeVisible()
    await expect(page.getByText('Please give your full name.')).toBeVisible()
  })

  test('a rejected application keeps its answers, including the role', async ({ page }) => {
    await page.goto('/editors/apply')
    await page.locator('[name="name"]').fill('Ada Lovelace')
    await page.locator('[name="role"]').selectOption({ index: 1 })
    await page.locator('[name="statement"]').fill('Short')

    const role = await page.locator('[name="role"]').inputValue()
    await page.getByRole('button', { name: 'Send application' }).click()
    await expect(page.getByText('Please say why you want this role.')).toBeVisible()

    await expect(page.locator('[name="name"]')).toHaveValue('Ada Lovelace')
    await expect(page.locator('[name="statement"]')).toHaveValue('Short')
    await expect(page.locator('[name="role"]')).toHaveValue(role)
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

test.describe('rejected fields', () => {
  test('the submission form names them and marks them, one at a time', async ({ page }) => {
    await page.goto('/submit')

    // Everything filled except the abstract, which is below its minimum.
    await page.locator('[name="author"]').fill('Ada Lovelace')
    await page.locator('[name="email"]').fill('ada@university.edu')
    await page.locator('[name="institution"]').fill('University of London')
    await page.locator('[name="section"]').selectOption({ index: 1 })
    await page.locator('[name="title"]').fill('On the Analytical Engine')
    await page.locator('[name="abstract"]').fill('Too short.')
    await page.locator('[name="originality"]').check()
    await page.getByRole('button', { name: 'Submit manuscript' }).click()

    await expect(page.getByRole('status')).toContainText('the abstract')
    await expect(page.locator('[name="abstract"]')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('[name="title"]')).not.toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('[name="abstract"]')).toHaveCSS(
      'border-left-color',
      'rgb(93, 29, 33)',
    )
  })

  test('an unticked originality box is named, not left silent', async ({ page }) => {
    await page.goto('/submit')
    await page.getByRole('button', { name: 'Submit manuscript' }).click()
    await expect(page.getByRole('status')).toContainText('the originality confirmation')
  })

  /**
   * A rejected form keeps what was typed. React empties a form once its action
   * returns, which used to throw away a finished abstract because a box was
   * left unticked; the select and the checkbox are here by name because React
   * restores a text input after that reset but not either of those.
   */
  test('a rejected submission keeps every answer, including the select', async ({ page }) => {
    await page.goto('/submit')

    await page.locator('[name="author"]').fill('Ada Lovelace')
    await page.locator('[name="email"]').fill('ada@university.edu')
    await page.locator('[name="institution"]').fill('University of London')
    await page.locator('[name="section"]').selectOption({ index: 1 })
    await page.locator('[name="title"]').fill('On the Analytical Engine')
    await page.locator('[name="abstract"]').fill('Too short.')
    await page.locator('[name="originality"]').check()

    const section = await page.locator('[name="section"]').inputValue()
    await page.getByRole('button', { name: 'Submit manuscript' }).click()
    await expect(page.locator('[name="abstract"]')).toHaveAttribute('aria-invalid', 'true')

    await expect(page.locator('[name="author"]')).toHaveValue('Ada Lovelace')
    await expect(page.locator('[name="email"]')).toHaveValue('ada@university.edu')
    await expect(page.locator('[name="institution"]')).toHaveValue('University of London')
    await expect(page.locator('[name="title"]')).toHaveValue('On the Analytical Engine')
    await expect(page.locator('[name="abstract"]')).toHaveValue('Too short.')
    await expect(page.locator('[name="section"]')).toHaveValue(section)
    await expect(page.locator('[name="originality"]')).toBeChecked()
  })

  test('the contact form keeps its answers too', async ({ page }) => {
    await page.goto('/contact')
    await page.locator('[name="name"]').fill('Ada Lovelace')
    await page.locator('[name="topic"]').selectOption({ index: 1 })
    await page.locator('[name="message"]').fill('Short')

    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Please say a little more so we can answer properly.')).toBeVisible()

    await expect(page.locator('[name="name"]')).toHaveValue('Ada Lovelace')
    await expect(page.locator('[name="message"]')).toHaveValue('Short')
    await expect(page.locator('[name="topic"]')).not.toHaveValue('')
  })
})

test.describe('character counts', () => {
  test('the abstract counts towards its minimum, then towards its ceiling', async ({ page }) => {
    await page.goto('/submit')
    const count = page.locator('form').getByText(/\/ (40 minimum|3000)$/)

    await expect(count).toHaveText('0 / 40 minimum')
    await page.locator('[name="abstract"]').fill('Only a few words here.')
    await expect(count).toHaveText('22 / 40 minimum')

    await page.locator('[name="abstract"]').fill('x'.repeat(80))
    await expect(count).toHaveText('80 / 3000')
  })
})

test.describe('manuscript attachment', () => {
  const FILE = {
    name: 'anonymised-manuscript.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  }

  const LETTER = {
    name: 'cover-letter.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 letter'),
  }

  /** A submission is two files, so each box has its own Choose file label. */
  test('offers a box for the manuscript and a box for the cover letter', async ({ page }) => {
    await page.goto('/submit')

    await expect(page.getByText('Attach anonymised manuscript')).toBeVisible()
    await expect(page.getByText('Attach cover letter')).toBeVisible()
    await expect(page.getByText('Choose file')).toHaveCount(2)
  })

  test('names the attached file and can remove it again', async ({ page }) => {
    await page.goto('/submit')
    const input = page.locator('input[name="manuscript"]')

    await expect(page.getByText('Choose file')).toHaveCount(2)

    await input.setInputFiles(FILE)
    await expect(page.getByText(FILE.name)).toBeVisible()
    // The cover letter box still has its own, so one label goes, not both.
    await expect(page.getByText('Choose file')).toHaveCount(1)

    await page.getByRole('button', { name: `Remove ${FILE.name}` }).click()

    await expect(page.getByText(FILE.name)).toHaveCount(0)
    await expect(page.getByText('Choose file')).toHaveCount(2)
  })

  test('the two boxes hold their files independently', async ({ page }) => {
    await page.goto('/submit')

    await page.locator('input[name="manuscript"]').setInputFiles(FILE)
    await page.locator('input[name="coverLetter"]').setInputFiles(LETTER)

    await expect(page.getByText(FILE.name)).toBeVisible()
    await expect(page.getByText(LETTER.name)).toBeVisible()

    // Removing one leaves the other attached.
    await page.getByRole('button', { name: `Remove ${FILE.name}` }).click()
    await expect(page.getByText(FILE.name)).toHaveCount(0)
    await expect(page.getByText(LETTER.name)).toBeVisible()
  })

  /**
   * A cover letter is one page. Its ceiling is five megabytes rather than the
   * manuscript's twenty, so attaching the two the wrong way round is caught
   * here rather than by an editor opening the file.
   */
  test('a cover letter over 5 MB is refused before anything is uploaded', async ({ page }) => {
    await page.goto('/submit')
    await page.locator('input[name="coverLetter"]').setInputFiles({
      name: 'not-a-letter.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(6 * 1024 * 1024),
    })

    await expect(page.getByText('That file is 6.0 MB. The limit is 5 MB.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit manuscript' })).toBeDisabled()
  })

  test('removing the file really empties the input, not just the label', async ({ page }) => {
    await page.goto('/submit')
    const input = page.locator('input[name="manuscript"]')

    await input.setInputFiles(FILE)
    await page.getByRole('button', { name: `Remove ${FILE.name}` }).click()

    const count = await input.evaluate((el) => (el as HTMLInputElement).files?.length ?? -1)
    expect(count).toBe(0)
  })

  /**
   * Anything up to 20 MB is accepted, and the file goes straight from the
   * browser to storage rather than through a Server Action, which is what
   * makes that possible. Over the limit is refused on sight: nobody should
   * spend a long upload to be told afterwards.
   */
  test('a file over 20 MB is refused before anything is uploaded', async ({ page }) => {
    await page.goto('/submit')
    await page.locator('input[name="manuscript"]').setInputFiles({
      name: 'far-too-long.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(21 * 1024 * 1024),
    })

    await expect(page.getByText('That file is 21.0 MB. The limit is 20 MB.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit manuscript' })).toBeDisabled()
  })

  test('a file well over the old 1 MB action limit is accepted', async ({ page }) => {
    await page.goto('/submit')
    await page.locator('input[name="manuscript"]').setInputFiles({
      name: 'eight-megabytes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(8 * 1024 * 1024),
    })

    await expect(page.getByText('8.0 MB')).toBeVisible()
    await expect(page.getByText('The limit is 20 MB.')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Submit manuscript' })).toBeEnabled()
  })
})
