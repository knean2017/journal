import { expect, test } from '@playwright/test'

/**
 * The templates are offered in a dialog on the submission page rather than on
 * a page of their own, so an author never leaves the form to fetch them. What
 * matters is that the dialog opens, closes the ways a modal is expected to,
 * and hands over the Word file rather than a picture of it.
 */
test.describe('template downloads', () => {
  const openDialog = async (page: import('@playwright/test').Page) => {
    await page.goto('/submit')
    await page.getByRole('button', { name: 'Download templates' }).click()
    return page.getByRole('dialog')
  }

  test('the submit page opens both templates in one dialog', async ({ page }) => {
    const dialog = await openDialog(page)

    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Manuscript template')).toBeVisible()
    await expect(dialog.getByText('Cover letter template')).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Word (.docx)' })).toHaveCount(2)
  })

  test('escape closes it', async ({ page }) => {
    const dialog = await openDialog(page)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the close button closes it', async ({ page }) => {
    const dialog = await openDialog(page)

    await dialog.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).toBeHidden()
  })

  test('each Word button downloads its own docx', async ({ page }) => {
    const dialog = await openDialog(page)

    for (const [index, name] of [
      'ICRR-Manuscript-Template.docx',
      'ICRR-Cover-Letter-Template.docx',
    ].entries()) {
      const download = page.waitForEvent('download')
      await dialog.getByRole('link', { name: 'Word (.docx)' }).nth(index).click()
      expect((await download).suggestedFilename()).toBe(name)
    }
  })

  test('the page it was removed from is gone', async ({ page }) => {
    const response = await page.goto('/templates')
    expect(response?.status()).toBe(404)
  })
})
