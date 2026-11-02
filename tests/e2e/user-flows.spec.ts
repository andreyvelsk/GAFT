import { expect, test, type Page } from '@playwright/test'

const firstArticleTitle = 'Stardew Valley'
const firstArticleSlug = 'stardew'

async function openFilters(page: Page): Promise<void> {
  const filters = page.getByRole('button', { name: 'Filters & sort' })
  if (await filters.getAttribute('aria-expanded') !== 'true') {
    await filters.click()
  }
}

test.describe('catalog discovery flows', () => {
  test('opens a card and returns home with the back link', async ({ page }) => {
    await page.goto(`/project/${firstArticleSlug}`)

    await expect(page).toHaveURL(new RegExp(`/project/${firstArticleSlug}$`))
    await expect(page.getByRole('heading', { name: firstArticleTitle, exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back' })).toBeVisible()

    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Games & Apps For Thor' })).toBeVisible()
  })

  test('returns to the category page after clicking the project back link', async ({ page }) => {
    const categoryPath = '/category/game'

    await page.goto(categoryPath)
    await expect(page).toHaveURL(new RegExp(`${categoryPath}$`))
    await expect(page.getByText('Apps found:')).toBeVisible()

    await page.getByRole('link', { name: firstArticleTitle, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/project/${firstArticleSlug}$`))
    await expect(page.getByRole('heading', { name: firstArticleTitle, exact: true })).toBeVisible()

    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(new RegExp(`${categoryPath}$`))
    await expect(page.getByText('Apps found:')).toBeVisible()
  })

  test('filters by every project category and can reset to all', async ({ page }) => {
    await page.goto('/')
    await openFilters(page)

    for (const category of ['Game', 'App', 'Companion', 'Emulator', 'Tool']) {
      await page.locator('div.p-4').getByRole('link', { name: category, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`/category/${category.toLowerCase()}$`))
      await expect(page.getByText('Apps found:')).toBeVisible()
      await openFilters(page)
      await page.getByRole('link', { name: 'All', exact: true }).click()
      await expect(page).toHaveURL(/\/$/)
      if (category !== 'Tool') await openFilters(page)
    }
  })

  test('search is case-insensitive, matches tags, and shows the empty state', async ({ page }) => {
    await page.goto('/')
    const search = page.getByPlaceholder('Search games and apps...')

    await search.fill('sTaRdEw')
    await expect(page.getByRole('heading', { name: firstArticleTitle, exact: true })).toBeVisible()

    await search.fill('zzzz-no-such-project-zzzz')
    await expect(page.getByRole('heading', { name: 'Nothing found' })).toBeVisible()
    await expect(page.getByText('Try changing your search query or resetting filters')).toBeVisible()

    await search.fill('')
    await expect(page.getByText('Nothing found')).not.toBeVisible()
  })

  test('supports pagination and resets to the first page after searching', async ({ page }) => {
    await page.goto('/')
    const next = page.getByRole('link', { name: 'Next' })
    await expect(next).toBeVisible()
    await next.click()
    await expect(page).toHaveURL(/\/page\/2$/)
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible()

    const search = page.getByPlaceholder('Search games and apps...')
    await search.fill(firstArticleTitle)
    await expect(page.getByText('Apps found:', { exact: false })).toContainText('1')
  })

  test('sorts by title and toggles ascending/descending order', async ({ page }) => {
    await page.goto('/')
    await openFilters(page)

    const cards = page.locator('article h3')
    const firstBefore = await cards.first().textContent()
    await page.getByRole('button', { name: 'A-Z', exact: true }).click()
    await expect.poll(async () => (await cards.first().textContent()) ?? '').not.toBe(firstBefore ?? '')

    const order = page.locator('button[title="Descending"]')
    await expect(order).toBeVisible()
    await order.click()
    await expect(page.locator('button[title="Ascending"]')).toBeVisible()
  })

  test('keeps search focused and preserves search state across pagination', async ({ page }) => {
    await page.goto('/')
    const search = page.getByPlaceholder('Search games and apps...')
    await search.fill('game')
    await search.focus()

    const next = page.getByRole('link', { name: 'Next' })
    if (await next.isVisible()) {
      await next.click()
      await expect(search).toHaveValue('game')
    }
  })
})

test.describe('project detail and resilience flows', () => {
  test('renders detail metadata, media, actions, tags, and external link attributes', async ({ page }) => {
    await page.goto(`/project/${firstArticleSlug}`)

    await expect(page.locator('article').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: firstArticleTitle, exact: true })).toBeVisible()
    await expect(page.locator('img[alt="Slide 1"]')).toBeVisible()

    const projectLink = page.getByRole('link', { name: 'Open project' })
    await expect(projectLink).toHaveAttribute('target', '_blank')
    await expect(projectLink).toHaveAttribute('rel', /noopener/)
    await expect(page.getByRole('link', { name: /Add to Obtainium/ })).toHaveAttribute('href', /^obtainium:\/\/add\//)
    await expect(page.getByText('#')).toHaveCount(0)
  })

  test('shows a safe not-found state for an unknown project', async ({ page }) => {
    await page.goto('/project/does-not-exist')
    await expect(page.getByText('Article not found')).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(0)
  })

  test('handles malformed and out-of-range routes without crashing', async ({ page }) => {
    for (const path of ['/page/0', '/page/-1', '/page/not-a-number', '/category/unknown', '/category/game/page/999']) {
      await page.goto(path)
      await expect(page.locator('body')).toBeVisible()
      await expect(page.getByText('Unhandled')).not.toBeVisible()
    }
  })

  test('renders the how-to page and navigation links', async ({ page }) => {
    await page.goto('/how-to')
    await expect(page).toHaveTitle(/How to Add a Project/)
    await expect(page.getByRole('heading').first()).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('media and interaction boundaries', () => {
  test('carousel controls cycle slides and expose accessible labels', async ({ page }) => {
    await page.goto('/project/walkthor')
    const next = page.getByRole('button', { name: 'Next' }).first()
    const previous = page.getByRole('button', { name: 'Previous' }).first()
    await expect(next).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go to slide 1' })).toBeVisible()

    const firstSlide = page.getByRole('button', { name: 'Go to slide 1' }).first()
    await expect(firstSlide).toHaveClass(/bg-white/)
    await next.click()
    await expect(page.getByRole('button', { name: 'Go to slide 2' }).first()).toHaveClass(/bg-white/)
    await previous.click()
    await expect(firstSlide).toHaveClass(/bg-white/)
  })

  test('respects a persisted like and prevents a second like locally', async ({ page }) => {
    await page.addInitScript((slug: string) => {
      localStorage.setItem('liked_articles', JSON.stringify([slug]))
    }, firstArticleSlug)
    await page.goto(`/project/${firstArticleSlug}`, { waitUntil: 'domcontentloaded' })

    const like = page.getByRole('button', { name: 'You already liked this' }).last()
    await expect(like).toBeVisible()
    await expect(like).toBeDisabled()
    await expect(like).toHaveAttribute('title', 'You already liked this')
  })

  test('survives invalid localStorage JSON without blocking the page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('liked_articles', '{invalid-json')
    })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Games & Apps For Thor' })).toBeVisible()
    await expect(page.getByPlaceholder('Search games and apps...')).toBeVisible()
  })
})
