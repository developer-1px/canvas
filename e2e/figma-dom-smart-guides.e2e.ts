import { expect, test } from '@playwright/test'

test('shows DOM smart guide families around the workspace stat row', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await page.getByRole('button', { name: 'Select layer Pipeline panel' })
    .click()
  await expect(page.locator('[data-figma-dom-node="workspacePipeline"]'))
    .toHaveAttribute('data-selected', 'true')

  await page.getByRole('button', { name: 'Measure tool' }).click()

  await expect.poll(() => page.locator('.figma-smart-guide').count())
    .toBeGreaterThan(0)
  await expect.poll(() =>
    page.locator('.figma-smart-guide--alignment').count())
    .toBeGreaterThan(0)
  await expect.poll(() =>
    page.locator('.figma-smart-guide--distance').count())
    .toBeGreaterThan(0)
  await expect.poll(() =>
    page.locator('.figma-smart-guide--horizontal').count())
    .toBeGreaterThan(0)
  await expect.poll(() =>
    page.locator('.figma-smart-guide--vertical').count())
    .toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await expect(page.locator('[data-figma-dom-node="workspaceStatRevenue"]'))
    .toHaveAttribute('data-selected', 'true')

  await expect.poll(() =>
    page.locator('.figma-smart-guide--equal-spacing').count())
    .toBeGreaterThan(0)
})
