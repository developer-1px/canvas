import { expect, test } from '@playwright/test'

test('opens the product brainstorming board on /', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('main.canvas-app')).toBeVisible()
  await expect(page.locator('main.engine-demo-app')).toHaveCount(0)
  await expect(page.getByRole('toolbar', { name: 'Tools' })).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Zoom controls' }))
    .toBeVisible()
  await expect(page.locator('.canvas-status')).toContainText('select')
})

test('keeps the engine verification demo on /engine', async ({ page }) => {
  await page.goto('/engine')

  await expect(page.locator('main.engine-demo-app')).toBeVisible()
  await expect(page.locator('main.canvas-app')).toHaveCount(0)
  await expect(page.getByRole('toolbar', {
    name: 'Engine affordances',
  })).toBeVisible()
  await expect(page.getByRole('toolbar', {
    name: 'Viewport controls',
  })).toBeVisible()
})
