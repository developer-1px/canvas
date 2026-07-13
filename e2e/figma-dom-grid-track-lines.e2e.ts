import { expect, test, type Locator, type Page } from '@playwright/test'

test('reveals only hovered grid tracks and their boundary lines', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(gridLine(page, 'column')).toHaveCount(0)
  await expect(gridLine(page, 'row')).toHaveCount(0)
  await expect(gridLineLabel(page, 'column')).toHaveCount(0)
  await expect(gridLineLabel(page, 'row')).toHaveCount(0)
  await expect(page.locator('.figma-grid-track-size')).toHaveCount(0)

  const gridBox = await getRequiredBox(
    page.locator('[data-design-node-id="workspaceContent"]'),
  )
  await page.mouse.move(gridBox.x + 24, gridBox.y + gridBox.height / 2)
  await expect(gridTrackSize(page, 'column')).toHaveCount(1)
  await expect(gridTrackSize(page, 'column')).toContainText(/c1 .*px/)
  await expect(gridTrackSize(page, 'row')).toHaveCount(1)
  await expect(gridTrackSize(page, 'row')).toContainText(/r1 .*px/)
  await expect(gridLine(page, 'column')).toHaveCount(2)
  await expect(gridLineLabel(page, 'column')).toHaveText(['1', '2'])
  await expect(gridLine(page, 'row')).toHaveCount(2)
  await expect(gridLineLabel(page, 'row')).toHaveText(['1', '2'])
  await expect(page.getByRole('button', { name: 'Alignment editor' }))
    .toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await expectGridLinesMatchHoveredTracks(page)

  await selectLayer(page, 'Select layer Stats row', 'workspaceStats')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)
  await expect(page.locator('.figma-grid-line-label')).toHaveCount(0)

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(gridLine(page, 'column')).toHaveCount(0)
  await expect(gridLine(page, 'row')).toHaveCount(0)
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

async function expectGridLinesMatchHoveredTracks(page: Page) {
  const gridBox = await getRequiredBox(
    page.locator('[data-design-node-id="workspaceContent"]'),
  )
  const firstColumnLine = await getRequiredBox(
    gridLine(page, 'column').nth(0),
  )
  const lastColumnLine = await getRequiredBox(gridLine(page, 'column').nth(1))
  const firstRowLine = await getRequiredBox(gridLine(page, 'row').nth(0))
  const lastRowLine = await getRequiredBox(gridLine(page, 'row').nth(1))

  expect(Math.abs(centerX(firstColumnLine) - gridBox.x)).toBeLessThanOrEqual(1)
  expect(centerX(lastColumnLine)).toBeGreaterThan(centerX(firstColumnLine))
  expect(Math.abs(centerY(firstRowLine) - gridBox.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(centerY(lastRowLine) - bottom(gridBox))).toBeLessThanOrEqual(1)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function gridLine(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-grid-line-axis="${axis}"]`)
}

function gridLineLabel(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-grid-line-label-axis="${axis}"]`)
}

function gridTrackSize(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-grid-track-size-axis="${axis}"]`)
}

function bottom(box: { height: number; y: number }) {
  return box.y + box.height
}

function centerX(box: { width: number; x: number }) {
  return box.x + box.width / 2
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}
