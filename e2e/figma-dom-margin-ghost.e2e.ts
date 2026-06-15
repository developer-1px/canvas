import { expect, test, type Page } from '@playwright/test'

test('shows read-only margin ghost bands in X-ray and measure modes', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Secondary action' })
    .click()

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(xrayMarginGhost(page)).toHaveCount(4)
  await expect(xrayMarginGhost(page).first()).toHaveAttribute(
    'data-margin-readonly',
    'true',
  )
  await expect(xrayMarginGhost(page).getByRole('button')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(measureMarginGhost(page)).toHaveCount(4)
  await expect(page.locator('.figma-margin-ghost-label').first()).toContainText(
    'Margin 6',
  )

  await page.getByRole('button', { name: 'Select layer Primary action' })
    .click()
  await expect(measureMarginGhost(page)).toHaveCount(0)
})

function measureMarginGhost(page: Page) {
  return page.locator(
    '.figma-margin-ghost[data-margin-ghost-owner="selected"]',
  )
}

function xrayMarginGhost(page: Page) {
  return page.locator(
    '.figma-margin-ghost[data-box-model-owner="selected"]',
  )
}
