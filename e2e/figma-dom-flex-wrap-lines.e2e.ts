import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows flex-wrap line guides and line gap values', async ({ page }) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Audience tags', 'workspaceAudienceTags')
  await expect(flexWrapLine(page)).toHaveCount(2)
  await expect(flexWrapLineLabel(page)).toHaveText(['line 1', 'line 2'])
  await expect(flexWrapLineGap(page)).toHaveCount(1)
  await expect(flexWrapLineGapLabel(page)).toContainText(/row gap \d+/)
  await expectLineContainsNode(
    flexWrapLine(page).nth(0),
    page.locator('[data-figma-dom-node="workspaceAudienceTagEnterprise"]'),
  )
  await expectLineContainsNode(
    flexWrapLine(page).nth(1),
    page.locator('[data-figma-dom-node="workspaceAudienceTagExpansion"]'),
  )

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await expect(flexWrapLine(page)).toHaveCount(0)
  await expect(flexWrapLineGap(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Audience tags', 'workspaceAudienceTags')
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expectLineContainsNode(
    flexWrapLine(page).nth(0),
    page.locator('[data-figma-dom-node="workspaceAudienceTagRenewal"]'),
  )
  await expectLineContainsNode(
    flexWrapLine(page).nth(1),
    page.locator('[data-figma-dom-node="workspaceAudienceTagRisk"]'),
  )
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

async function expectLineContainsNode(line: Locator, node: Locator) {
  const lineBox = await getRequiredBox(line)
  const nodeBox = await getRequiredBox(node)

  expect(lineBox.x).toBeLessThanOrEqual(nodeBox.x + 1)
  expect(lineBox.y).toBeLessThanOrEqual(nodeBox.y + 1)
  expect(right(lineBox)).toBeGreaterThanOrEqual(right(nodeBox) - 1)
  expect(bottom(lineBox)).toBeGreaterThanOrEqual(bottom(nodeBox) - 1)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function flexWrapLine(page: Page) {
  return page.locator('.figma-flex-wrap-line')
}

function flexWrapLineGap(page: Page) {
  return page.locator('.figma-flex-wrap-line-gap')
}

function flexWrapLineGapLabel(page: Page) {
  return page.locator('.figma-flex-wrap-line-gap-label')
}

function flexWrapLineLabel(page: Page) {
  return page.locator('.figma-flex-wrap-line-label')
}

function bottom(box: { height: number; y: number }) {
  return box.y + box.height
}

function right(box: { width: number; x: number }) {
  return box.x + box.width
}
