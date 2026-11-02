import { expect, test } from '@playwright/test'

test.describe('component behavior through the real page', () => {
  test('SearchBar shows and clears its clear button', async ({ page }) => {
    await page.goto('/')

    const search = page.getByPlaceholder('Search games and apps...')
    const clearButton = page.getByRole('button', { name: 'Clear search' })

    await expect(clearButton).not.toBeVisible()
    await search.fill('Stardew')
    await expect(clearButton).toBeVisible()

    await clearButton.click()
    await expect(search).toHaveValue('')
    await expect(clearButton).not.toBeVisible()
  })

  test('filters panel toggles independently', async ({ page }) => {
    await page.goto('/')

    const filtersButton = page.getByRole('button', { name: 'Filters & sort' })
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'false')

    await filtersButton.click()
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Category:', { exact: true })).toBeVisible()
  })

  test('ProjectActions exposes project, Obtainium, and source links', async ({ page }) => {
    await page.goto('/project/bluejay')

    const projectLink = page.getByRole('link', { name: 'Open project' })
    const obtainiumLink = page.getByRole('link', { name: /Add to Obtainium/ })
    const sourceLink = page.getByRole('link', { name: 'View source' })

    await expect(projectLink).toHaveAttribute('href', 'https://github.com/tsutsen/bluejay')
    await expect(projectLink).toHaveAttribute('target', '_blank')
    await expect(projectLink).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(obtainiumLink).toHaveAttribute('href', 'obtainium://add/https://github.com/tsutsen/bluejay')
    await expect(obtainiumLink).toHaveAttribute('aria-label', 'Add to Obtainium (opens Obtainium app)')
    await expect(sourceLink).toHaveAttribute('href', /reddit\.com\/r\/AynThor/)
    await expect(sourceLink).toHaveAttribute('target', '_blank')
  })
})
