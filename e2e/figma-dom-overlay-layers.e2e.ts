import { expect, test } from '@playwright/test'

test('toggles DOM overlay layer families independently', async ({ page }) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await expect(page.getByRole('checkbox', { name: 'Flex overlays' }))
    .toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Grid overlays' }))
    .toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Spacing overlays' }))
    .toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Guides overlays' }))
    .toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Box overlays' }))
    .toBeChecked()

  await page.getByRole('button', { name: 'Select layer Stats row' }).click()
  await expect.poll(() => page.locator('.figma-autolayout-gap').count())
    .toBeGreaterThan(0)
  await page.getByRole('checkbox', { name: 'Flex overlays' }).uncheck()
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await expect(page.locator('.figma-guide-selected')).toHaveCount(1)

  await page.getByRole('checkbox', { name: 'Flex overlays' }).check()
  await page.getByRole('button', { name: 'Select layer Content grid' }).click()
  await expect.poll(() => page.locator('.figma-grid-gap').count())
    .toBeGreaterThan(0)
  await page.getByRole('checkbox', { name: 'Grid overlays' }).uncheck()
  await expect(page.locator('.figma-grid-gap')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-smart-guide').count())
    .toBeGreaterThan(0)
  await page.getByRole('checkbox', { name: 'Spacing overlays' }).uncheck()
  await expect(page.locator('.figma-smart-guide')).toHaveCount(0)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-frame-guide-distance')).toHaveCount(0)

  await expect.poll(() => page.locator('.figma-frame-guide--ruler').count())
    .toBeGreaterThan(0)
  await page.getByRole('checkbox', { name: 'Guides overlays' }).uncheck()
  await expect(page.locator('.figma-frame-guide--ruler')).toHaveCount(0)
  await expect(page.locator('.figma-layout-guide-column')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect.poll(() => page.locator('.figma-boxmodel-content').count())
    .toBeGreaterThan(0)
  await page.getByRole('checkbox', { name: 'Box overlays' }).uncheck()
  await expect(page.locator('.figma-boxmodel-content')).toHaveCount(0)
})
