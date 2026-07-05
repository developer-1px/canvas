import { expect, test, type Page } from '@playwright/test'

test('shows read-only margin ghost bands in X-ray and measure modes', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
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
  await expect(xrayMarginGhost(page).first()).toHaveCSS(
    'pointer-events',
    'none',
  )
  await expect(page.locator('.figma-boxmodel-value--margin'))
    .toContainText('read-only')
  await expect(xrayMarginGhost(page).getByRole('button')).toHaveCount(0)
  await expect(page.locator('[data-dom-edit-margin-kind]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(measureMarginGhost(page)).toHaveCount(4)
  await expect(measureMarginGhost(page).first()).toHaveCSS(
    'pointer-events',
    'none',
  )
  await expect(page.locator('.figma-margin-ghost-label').first()).toContainText(
    'Margin 6 read-only',
  )
  await expect(page.locator('[data-dom-edit-margin-kind]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select layer Primary action' })
    .click()
  await expect(measureMarginGhost(page)).toHaveCount(0)
})

test('distinguishes margin-derived spacing without margin handles', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Deal row 1' })
    .click()

  await page.getByRole('spinbutton', { name: 'Mar' }).fill('10')
  await page.getByRole('button', { name: 'Measure tool' }).click()

  await expect(page.locator(
    '.figma-smart-guide[data-smart-guide-spacing-source="margin"]',
  )).not.toHaveCount(0)
  await expect(page.locator('[data-dom-edit-margin-kind]')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-margin')).toHaveCount(0)
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
