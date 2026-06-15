import { expect, test, type Page } from '@playwright/test'

test('shows box-model X-ray layers for selected and hovered nodes', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Hero panel' }).click()
  await page.getByRole('spinbutton', { name: 'Mar' }).fill('12')

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await expect(selectedLayer(page, 'content')).toHaveCount(1)
  await expect(selectedLayer(page, 'border')).toHaveCount(1)
  await expect(selectedLayer(page, 'padding')).toHaveCount(4)
  await expect(selectedLayer(page, 'margin')).toHaveCount(4)

  await page.locator('[data-figma-dom-node="workspacePrimaryAction"]').hover()
  await expect(hoverLayer(page, 'content')).toHaveCount(1)
  await expect(selectedLayer(page, 'content')).toHaveCount(1)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)
})

function hoverLayer(page: Page, layer: string) {
  return page.locator(
    `.figma-boxmodel-layer[data-box-model-owner="hover"][data-box-model-layer="${layer}"]`,
  )
}

function selectedLayer(page: Page, layer: string) {
  return page.locator(
    `.figma-boxmodel-layer[data-box-model-owner="selected"][data-box-model-layer="${layer}"]`,
  )
}
