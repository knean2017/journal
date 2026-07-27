import { expect, test } from '@playwright/test'

test.describe('home', () => {
  test('hero renders the headline and both calls to action', async ({ page }) => {
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toContainText('Connecting researches')
    await expect(h1).toContainText('across borders')
    await expect(page.getByRole('link', { name: 'Submit a Manuscript' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Read the Call for Papers' })).toBeVisible()
  })

  test('announcement bar rotates', async ({ page }) => {
    await page.goto('/')
    const ticker = page.locator('[aria-live="polite"]')
    const first = await ticker.textContent()
    await expect(ticker).not.toHaveText(first ?? '', { timeout: 9000 })
  })

  test('closing CTA carries the only gold-filled button', async ({ page }) => {
    await page.goto('/')
    const gold = page.locator('.btn-gold')
    await expect(gold).toHaveCount(1)
    await expect(gold).toHaveCSS('background-color', 'rgb(192, 162, 101)')
  })

  test('nothing above the fold is blank on arrival', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const blankInViewport = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter((el) => {
        const withinFold = el.getBoundingClientRect().top < window.innerHeight * 0.92
        return withinFold && getComputedStyle(el).opacity === '0'
      }).length,
    )
    expect(blankInViewport).toBe(0)
  })

  test('reveals a below-the-fold section once it scrolls into view', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('[data-reveal]').first()
    await expect(section).toHaveCSS('opacity', '0')

    await section.scrollIntoViewIfNeeded()
    await expect(section).toHaveCSS('opacity', '1')
  })
})

test.describe('about', () => {
  test('renders the four policy sections', async ({ page }) => {
    await page.goto('/about')
    for (const heading of [
      'Aims and scope',
      'Review policy',
      'Publication ethics',
      'Open access and copyright',
    ]) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
  })

  test('review policy does not promise author feedback', async ({ page }) => {
    await page.goto('/about')
    const body = (await page.locator('main').textContent()) ?? ''
    expect(body).toContain('reviewer identities are not disclosed')
    expect(body.toLowerCase()).not.toContain('written feedback')
  })

  test('journal at a glance lists all six facts', async ({ page }) => {
    await page.goto('/about')
    for (const key of ['Founded', 'Access', 'Author fees', 'Review', 'Frequency', 'ISSN']) {
      await expect(page.getByText(key, { exact: true })).toBeVisible()
    }
  })
})

test.describe('current issue', () => {
  test('shows the heading, status, and all five timeline entries', async ({ page }) => {
    await page.goto('/issue/current')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Volume 1, Issue 1')
    await expect(page.getByText('Calls for papers are open')).toBeVisible()
    for (const title of [
      'Submissions open',
      'Issue 1 submissions close',
      'Peer review',
      'Decisions returned',
      'Publication',
    ]) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    }
  })

  test('table of contents preview is visibly muted', async ({ page }) => {
    await page.goto('/issue/current')
    await expect(page.getByTestId('toc-preview').locator('> div').first()).toHaveCSS(
      'opacity',
      '0.55',
    )
  })
})

test.describe('archives', () => {
  test('links Issue 1 to its status page', async ({ page }) => {
    await page.goto('/archives')
    await page.getByRole('link', { name: /issue status/i }).click()
    await expect(page).toHaveURL(/\/issue\/current$/)
  })

  test('shows the scheduled and future issue cards', async ({ page }) => {
    await page.goto('/archives')
    await expect(page.getByText('30 October 2026')).toBeVisible()
    await expect(page.getByText('Published at the end of each month')).toBeVisible()
  })
})

test.describe('authors directory', () => {
  test('lists all six contributors by default', async ({ page }) => {
    await page.goto('/authors')
    await expect(page.getByText('6 contributors')).toBeVisible()
  })

  test('filters by discipline and reflects it in the URL', async ({ page }) => {
    await page.goto('/authors')
    await page.getByRole('button', { name: 'Natural Sciences' }).click()
    await expect(page).toHaveURL(/filter=Natural(\+|%20)Sciences/)
    await expect(page.getByText('2 of 6 contributors')).toBeVisible()
  })

  test('searches across bio and interests', async ({ page }) => {
    await page.goto('/authors')
    await page.getByRole('searchbox').fill('proportionality')
    await expect(page.getByText('1 of 6 contributors')).toBeVisible()
    await expect(page.getByText('Sofia Almeida')).toBeVisible()
  })

  test('shows the empty state and clears filters', async ({ page }) => {
    await page.goto('/authors')
    await page.getByRole('searchbox').fill('zzzznotathing')
    await expect(page.getByText('No contributors match that search')).toBeVisible()
    await page.getByRole('link', { name: /clear filters/i }).click()
    await expect(page.getByText('6 contributors')).toBeVisible()
  })

  test('filter state survives a reload', async ({ page }) => {
    await page.goto('/authors?filter=Humanities')
    await expect(page.getByText('1 of 6 contributors')).toBeVisible()
    await page.reload()
    await expect(page.getByText('1 of 6 contributors')).toBeVisible()
  })

  test('opens an author profile', async ({ page }) => {
    await page.goto('/authors')
    await page.getByRole('link', { name: /Priya Nair/ }).click()
    await expect(page).toHaveURL(/\/authors\/priya-nair$/)
  })
})

test.describe('author profile', () => {
  test('renders a profile with a publication', async ({ page }) => {
    await page.goto('/authors/amara-okonkwo')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Amara Okonkwo')
    await expect(page.getByText('University of Edinburgh').first()).toBeVisible()
    await expect(page.getByText(/Canopy cover and summer surface temperature/)).toBeVisible()
  })

  test('renders the empty publications state', async ({ page }) => {
    await page.goto('/authors/sofia-almeida')
    await expect(
      page.getByText('No published articles yet. This author has work under review for Issue 1.'),
    ).toBeVisible()
  })

  test('shows a toast for actions with no backend', async ({ page }) => {
    await page.goto('/authors/amara-okonkwo')
    await page.getByRole('button', { name: /orcid/i }).click()
    await expect(page.getByRole('status')).toHaveText(
      'Not available yet. PDFs and author links go live with Issue 1.',
    )
  })

  test('returns 404 for an unknown author', async ({ page }) => {
    const response = await page.goto('/authors/not-a-real-person')
    expect(response?.status()).toBe(404)
  })
})

test.describe('our team', () => {
  test('shows the three core members and seven roles, no Editor-in-Chief', async ({ page }) => {
    await page.goto('/team')
    await expect(page.getByText('Ayla Ahmadova')).toBeVisible()
    await expect(page.getByText('Kanan Hajiyev')).toBeVisible()
    await expect(page.getByText('Gunel Ahmadova')).toBeVisible()
    await expect(page.getByText('Managing Editor', { exact: true })).toBeVisible()
    await expect(page.getByText('Copyeditor', { exact: true })).toBeVisible()
    await expect(page.getByText('Editor-in-Chief')).toHaveCount(0)
  })

  test('distinguishes pending from recruiting by colour', async ({ page }) => {
    await page.goto('/team')
    await expect(page.getByText('Appointment pending')).toHaveCSS('color', 'rgb(138, 123, 92)')
    await expect(page.getByText('Recruiting').first()).toHaveCSS('color', 'rgb(93, 29, 33)')
  })

  test('never says Editorial Board anywhere on the page', async ({ page }) => {
    await page.goto('/team')
    const body = (await page.locator('body').textContent()) ?? ''
    expect(body).not.toContain('Editorial Board')
  })
})

test.describe('submit', () => {
  test('lists all six manuscript requirements', async ({ page }) => {
    await page.goto('/submit')
    for (const key of [
      'Length',
      'File format',
      'Anonymisation',
      'Abstract',
      'References',
      'Figures',
    ]) {
      await expect(page.getByText(key, { exact: true })).toBeVisible()
    }
  })

  test('section select offers the five disciplines plus a placeholder', async ({ page }) => {
    await page.goto('/submit')
    await expect(page.getByRole('combobox').locator('option')).toHaveCount(6)
  })

  /**
   * Which message comes back depends on whether Supabase is configured: without
   * it the form answers with the pre-launch toast, with it an empty form fails
   * validation. Both are correct, so assert the form always answers.
   */
  test('submitting always answers with a toast', async ({ page }) => {
    await page.goto('/submit')
    await page.getByRole('button', { name: 'Submit manuscript' }).click()
    await expect(page.getByRole('status')).toContainText(
      /Submission portal opens with the call for papers|Please check the highlighted fields/,
    )
  })
})

test.describe('announcements', () => {
  test('renders the three announcements newest first', async ({ page }) => {
    await page.goto('/news')
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText(
      'Call for Papers: Volume 1, Issue 1',
    )
  })

  test('CTAs route to the right pages', async ({ page }) => {
    await page.goto('/news')
    await page.getByRole('link', { name: 'Meet the team' }).click()
    await expect(page).toHaveURL(/\/team$/)
  })

  test('newsletter signup shows the confirmation toast', async ({ page }) => {
    await page.goto('/news')
    await page.getByRole('textbox', { name: /email/i }).fill('reader@example.com')
    await page.getByRole('button', { name: 'Subscribe' }).click()
    await expect(page.getByRole('status')).toContainText(
      'Thanks. You will receive our calls for papers',
    )
  })
})

test.describe('article', () => {
  const SLUG = '/articles/canopy-cover-and-summer-surface-temperature'

  test('renders header, abstract, and the four numbered sections', async ({ page }) => {
    await page.goto(SLUG)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Canopy cover')
    await expect(page.getByRole('article').getByText('Abstract', { exact: true })).toBeVisible()
    await expect(page.getByText('Amara Okonkwo')).toBeVisible()
    for (const heading of ['1. Introduction', '2. Method', '3. Results', '4. Discussion']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
  })

  test('unpublished dates read TBA', async ({ page }) => {
    await page.goto(SLUG)
    await expect(page.getByText('TBA').first()).toBeVisible()
  })

  test('paragraphs are separated by space, not indentation', async ({ page }) => {
    await page.goto(SLUG)
    const indent = await page
      .locator('article p')
      .first()
      .evaluate((el) => getComputedStyle(el).textIndent)
    expect(indent).toBe('0px')
  })

  test('returns 404 for an unknown article', async ({ page }) => {
    const response = await page.goto('/articles/nope')
    expect(response?.status()).toBe(404)
  })
})
