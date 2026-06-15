import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows flex main-axis flow guides inside content lanes', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')

  await selectLayer(page, 'Select layer Hero panel', 'workspaceHero')
  await expect(axisGuide(page)).toHaveCount(1)
  await expect(axisGuide(page)).toHaveAttribute(
    'data-autolayout-axis-guide',
    'row',
  )
  await expect(axisGuide(page)).toHaveClass(/figma-autolayout-axis-guide--row/)
  await expectHorizontalGuideInside(page, 'workspaceHero')

  await selectLayer(page, 'Select layer Hero copy', 'workspaceHeroCopy')
  await expect(axisGuide(page)).toHaveCount(1)
  await expect(axisGuide(page)).toHaveAttribute(
    'data-autolayout-axis-guide',
    'column',
  )
  await expect(axisGuide(page))
    .toHaveClass(/figma-autolayout-axis-guide--column/)
  await expectVerticalGuideInside(page, 'workspaceHeroCopy')

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expect(axisGuide(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expect(axisGuide(page)).toHaveCount(0)
})

test('keeps main-axis guides visible while gap affordances are active', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')

  const fixedGap = page.locator('.figma-autolayout-gap').first()

  await fixedGap.hover()
  await expect(axisGuide(page)).toHaveCount(1)
  await expect(axisGuide(page)).toHaveAttribute(
    'data-autolayout-axis-guide',
    'row',
  )
  await expect(fixedGap).not.toHaveClass(/figma-autolayout-gap--empty/)
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

async function expectHorizontalGuideInside(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(axisGuide(page))

  expect(guideBox.x).toBeGreaterThan(nodeBox.x)
  expect(right(guideBox)).toBeLessThan(right(nodeBox))
  expect(guideBox.width).toBeLessThan(nodeBox.width)
  expect(guideBox.height).toBeLessThanOrEqual(3)
}

async function expectVerticalGuideInside(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(axisGuide(page))

  expect(guideBox.y).toBeGreaterThanOrEqual(nodeBox.y - 1)
  expect(bottom(guideBox)).toBeLessThanOrEqual(bottom(nodeBox) + 1)
  expect(guideBox.width).toBeLessThanOrEqual(3)
  expect(guideBox.height).toBeGreaterThan(24)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function axisGuide(page: Page) {
  return page.locator('.figma-autolayout-axis-guide')
}

function domNode(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`)
}

function bottom(box: { height: number; y: number }) {
  return box.y + box.height
}

function right(box: { width: number; x: number }) {
  return box.x + box.width
}
