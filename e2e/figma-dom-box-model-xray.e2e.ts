import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows box-model X-ray layers for selected and hovered nodes', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await page.getByRole('spinbutton', { name: 'Mar' }).fill('12')

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await expect(selectedLayer(page, 'content')).toHaveCount(1)
  await expect(selectedLayer(page, 'border')).toHaveCount(1)
  await expect(selectedLayer(page, 'padding')).toHaveCount(4)
  await expect(selectedLayer(page, 'margin')).toHaveCount(4)
  await expect(selectedValue(page, 'padding')).toContainText('Pad 20')
  await expect(selectedValue(page, 'margin')).toContainText('Margin 12')

  await page.locator('[data-design-node-id="workspaceDealOneTitle"]').hover()
  await expect(hoverLayer(page, 'content')).toHaveCount(1)
  await expect(hoverLayer(page, 'border')).toHaveCount(1)
  await expect(selectedLayer(page, 'content')).toHaveCount(1)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)
})

test('keeps zero padding and margin X-ray labels minimized', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()

  await expect(selectedLayer(page, 'content')).toHaveCount(1)
  await expect(selectedLayer(page, 'border')).toHaveCount(1)
  await expect(selectedLayer(page, 'padding')).toHaveCount(0)
  await expect(selectedLayer(page, 'margin')).toHaveCount(0)
  await expect(page.locator(
    '.figma-boxmodel-value[data-box-model-owner="selected"]',
  )).toHaveCount(0)
})

test('keeps X-ray bands out of active gap editing', async ({ page }) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(selectedLayer(page, 'padding')).toHaveCount(4)
  await page.getByRole('button', { name: 'Select tool' }).click()

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await startDrag(page, page.locator('.figma-autolayout-gap').first(), {
    x: 16,
    y: 0,
  })
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)
  await page.mouse.up()
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.locator(`[data-design-node-id="${nodeId}"]`))
    .toHaveAttribute('data-selected', 'true')
}

async function startDrag(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await handle.boundingBox()

  expect(box).not.toBeNull()

  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

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

function selectedValue(page: Page, layer: 'margin' | 'padding') {
  return page.locator(
    `.figma-boxmodel-value--${layer}[data-box-model-owner="selected"]`,
  )
}
