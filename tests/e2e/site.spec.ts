import { expect, test } from '@playwright/test'

test.describe('site smoke tests', () => {
  test('home page renders real content and navigation works', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Games & Apps for AYN Thor/)
    await expect(page.getByRole('heading', { name: 'Games & Apps For Thor' })).toBeVisible()
    await expect(page.getByPlaceholder('Search games and apps...')).toBeVisible()
    await expect(page.getByText('Apps found:')).toBeVisible()

    await page.getByRole('link', { name: 'How to Add' }).click()
    await expect(page).toHaveURL(/\/how-to$/)
  })

  test('search filters real content cards', async ({ page }) => {
    await page.goto('/')

    const search = page.getByPlaceholder('Search games and apps...')
    await search.fill('Stardew Valley')

    await expect(page.getByRole('heading', { name: 'Stardew Valley' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Civilization VI' })).not.toBeVisible()
  })
})
