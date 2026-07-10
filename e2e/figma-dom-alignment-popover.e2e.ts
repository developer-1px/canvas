import { expect, test, type Page } from '@playwright/test'

test('edits DOM alignment from the canvas popover', async ({ page }) => {
  await page.goto('/figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Hero actions' })
    .click()

  const trigger = page.getByRole('button', { name: 'Alignment editor' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const popover = page.getByRole('region', { name: 'Alignment editor' })
  await expect(popover).toBeVisible()

  await popover.getByRole('radio', { name: 'Justify center' }).focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => readJustifyContent(page, 'workspaceHeroActions'))
    .toBe('center')

  await page.keyboard.press('Escape')
  await expect(popover).toHaveCount(0)

  await trigger.click()
  await expect(popover).toBeVisible()

  await popover.getByRole('radio', { name: 'Align center' }).hover()
  await expect(page.locator('.figma-alignment-preview-guide')).toHaveCount(1)

  await popover.getByRole('radio', { name: 'Justify between' }).click()
  await expect.poll(() => readJustifyContent(page, 'workspaceHeroActions'))
    .toBe('space-between')
  await expect.poll(() => page.locator('.figma-autolayout-gap--between').count())
    .toBeGreaterThan(0)

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readJustifyContent(page, 'workspaceHeroActions'))
    .toBe('center')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect.poll(() => readJustifyContent(page, 'workspaceHeroActions'))
    .toBe('space-between')

  await page.getByRole('button', { name: 'Select layer Content grid' }).click()
  await page.getByRole('button', { name: 'Alignment editor' }).click()
  await expect(page.getByRole('region', { name: 'Alignment editor' }))
    .toBeVisible()
  await expect(page.getByRole('radio', { name: 'Justify between' }))
    .toHaveCount(0)
  await expect(page.getByRole('radio', { name: 'Align stretch' }))
    .toBeVisible()
})

async function readJustifyContent(
  page: Page,
  nodeId: string,
) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`).evaluate((element) =>
    getComputedStyle(element).justifyContent)
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
