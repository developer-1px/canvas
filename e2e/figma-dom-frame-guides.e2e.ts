import { expect, test, type Locator } from '@playwright/test'

test('shows frame-local DOM guides and responsive layout columns', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: /Desktop/ }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await expect(page.locator('[data-figma-dom-node="workspaceStatRevenue"]'))
    .toHaveAttribute('data-selected', 'true')

  await expect.poll(() => page.locator('.figma-frame-guide--ruler').count())
    .toBe(3)
  await expect.poll(() => page.locator('.figma-frame-guide--x').count())
    .toBeGreaterThan(0)
  await expect.poll(() => page.locator('.figma-frame-guide--y').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-frame-guide-distance')).toHaveCount(0)
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-frame-guide-distance').count())
    .toBeGreaterThan(0)
  await expect.poll(() => page.locator('.figma-layout-guide-column').count())
    .toBe(12)

  const firstColumn = page.locator('.figma-layout-guide-column').first()
  const desktopColumnWidth = await readElementWidth(firstColumn)

  await page.getByRole('button', { name: 'Select Workspace page section' })
    .click()
  await page.getByRole('button', { name: /Mobile/ }).click()
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()

  await expect.poll(() => page.locator('.figma-layout-guide-column').count())
    .toBe(4)
  await expect.poll(() => page.locator('.figma-frame-guide--x').count())
    .toBeGreaterThanOrEqual(2)
  await expect.poll(() => readElementWidth(firstColumn))
    .toBeLessThan(desktopColumnWidth)
})

async function readElementWidth(locator: Locator) {
  return locator.evaluate((element) =>
    element.getBoundingClientRect().width)
}
