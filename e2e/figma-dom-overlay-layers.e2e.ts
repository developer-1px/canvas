import { expect, test, type Page } from '@playwright/test'

test('keeps DOM overlay families available without visible layer toggles', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await expectOverlayToggleAbsent(page, 'Flex overlays')
  await expectOverlayToggleAbsent(page, 'Grid overlays')
  await expectOverlayToggleAbsent(page, 'Spacing overlays')
  await expectOverlayToggleAbsent(page, 'Guides overlays')
  await expectOverlayToggleAbsent(page, 'Box overlays')

  await page.getByRole('button', { name: 'Select layer Stats row' }).click()
  await expect.poll(() => page.locator('.figma-autolayout-gap').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-guide-selected')).toHaveCount(1)

  await page.getByRole('button', { name: 'Select layer Content grid' }).click()
  await expect.poll(() => page.locator('.figma-grid-gap').count())
    .toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-smart-guide').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-frame-guide--ruler')).toHaveCount(0)
  await expect(page.locator('.figma-layout-guide-column')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect.poll(() => page.locator('.figma-boxmodel-content').count())
    .toBeGreaterThan(0)
})

async function expectOverlayToggleAbsent(page: Page, name: string) {
  await expect(page.getByRole('checkbox', { name })).toHaveCount(0)
}
