import { expect, test, type Page } from '@playwright/test'

test('shows grid child occupied area and span guide', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(gridChildArea(page)).toHaveCount(1)
  await expect(gridChildBadge(page, 'column')).toHaveText('Col 1 / span 1')
  await expect(gridChildBadge(page, 'row')).toHaveText('Row 1 / span 1')
  await expectAreaMatchesSelected(page, 'workspacePipeline')

  await selectLayer(page, 'Select layer Activity panel', 'workspaceActivity')
  await expect(gridChildArea(page)).toHaveCount(1)
  await expect(gridChildBadge(page, 'column')).toHaveText('Col 2 / span 1')
  await expect(gridChildBadge(page, 'row')).toHaveText('Row 1 / span 1')
  await expectAreaMatchesSelected(page, 'workspaceActivity')

  await selectLayer(page, 'Select layer Hero copy', 'workspaceHeroCopy')
  await expect(gridChildArea(page)).toHaveCount(0)
  await expect(page.locator('.figma-grid-child-badge')).toHaveCount(0)

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(gridChildArea(page)).toHaveCount(0)
  await expect.poll(() => page.locator('.figma-grid-gap').count())
    .toBeGreaterThan(0)
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.locator(`[data-figma-dom-node="${nodeId}"]`))
    .toHaveAttribute('data-selected', 'true')
}

async function expectAreaMatchesSelected(page: Page, nodeId: string) {
  const selectedBox = await page.locator(`[data-figma-dom-node="${nodeId}"]`)
    .boundingBox()
  const areaBox = await gridChildArea(page).boundingBox()

  expect(selectedBox).not.toBeNull()
  expect(areaBox).not.toBeNull()
  expect(Math.abs(areaBox!.x - selectedBox!.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(areaBox!.y - selectedBox!.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(areaBox!.width - selectedBox!.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(areaBox!.height - selectedBox!.height)).toBeLessThanOrEqual(1)
}

function gridChildArea(page: Page) {
  return page.locator('.figma-grid-child-area')
}

function gridChildBadge(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-grid-child-badge="${axis}"]`)
}
