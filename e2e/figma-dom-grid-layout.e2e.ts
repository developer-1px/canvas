import { expect, test, type Page } from '@playwright/test'

test('shows grid layout controls only for a display grid selection', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await expect(frameLayoutGrid(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(gridLayoutOverlay(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(frameLayoutGrid(page)).toHaveCount(0)
  await expect(page.locator('.figma-grid-line')).not.toHaveCount(0)
  await expect(page.locator('.figma-grid-gap')).not.toHaveCount(0)
  await expect(page.locator('.figma-autolayout-toolbar')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
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

function frameLayoutGrid(page: Page) {
  return page.locator([
    '.figma-frame-guide--ruler',
    '.figma-layout-guide-column',
  ].join(','))
}

function gridLayoutOverlay(page: Page) {
  return page.locator([
    '.figma-grid-gap',
    '.figma-grid-line',
    '.figma-grid-line-label',
    '.figma-grid-track',
    '.figma-grid-track-hover',
    '.figma-grid-track-size',
    '.figma-grid-value',
  ].join(','))
}
