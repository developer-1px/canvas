import { expect, test } from '@playwright/test'

test('shows selected-to-hover DOM measurement redlines', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()

  await expect.poll(() => page.locator('.figma-guide-distance--inset').count())
    .toBeGreaterThan(0)
  await page.locator('[data-figma-dom-node="workspaceStatConversion"]').hover()
  await expect.poll(() => page.locator('.figma-guide-distance--gap').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-guide-distance span').first())
    .toContainText(/\d+ px/)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)

  await page.keyboard.down('Alt')
  await page.locator('[data-figma-dom-node="workspaceStatConversion"]').hover()
  await expect.poll(() => page.locator('.figma-guide-distance--gap').count())
    .toBeGreaterThan(0)
  await page.keyboard.up('Alt')
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
})
