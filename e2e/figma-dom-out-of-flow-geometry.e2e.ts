import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows geometry handles only for out-of-flow DOM nodes', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await page.keyboard.down(primaryModifier())
  await expect(moveable(page)).toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await page.keyboard.up(primaryModifier())

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await page.keyboard.down(primaryModifier())
  await expect(moveable(page)).toHaveCount(0)
  await page.keyboard.up(primaryModifier())

  await selectLayer(page, 'Select layer Floating note', 'workspaceFloatingNote')
  await page.keyboard.down(primaryModifier())
  await expect(moveable(page)).toHaveCount(1)
  await expect(page.locator('.moveable-control')).not.toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('[data-dom-layout-context-badge="absolute"]'))
    .toHaveCount(1)
  await page.keyboard.up(primaryModifier())
})

test('shows smart guides while dragging absolute DOM geometry', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Floating note', 'workspaceFloatingNote')

  const target = selectedNode(page, 'workspaceFloatingNote')
  const initialLeft = await readComputedPx(target, 'left')
  const targetBox = await getRequiredBox(target)

  await page.keyboard.down(primaryModifier())
  await page.mouse.move(centerX(targetBox), centerY(targetBox))
  await page.mouse.down()
  await page.mouse.move(centerX(targetBox) - 24, centerY(targetBox), {
    steps: 4,
  })

  await expect.poll(() => page.locator('.figma-smart-guide').count())
    .toBeGreaterThan(0)
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())

  await expect.poll(() => readComputedPx(target, 'left'))
    .toBeLessThan(initialLeft)
})

test('keeps smart guides aligned after zooming the absolute sample', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Floating note', 'workspaceFloatingNote')

  await page.keyboard.down(primaryModifier())
  await expect.poll(() => smartGuide(page).count()).toBeGreaterThan(0)
  const targetBefore = await getRequiredBox(selectedNode(page, 'workspaceFloatingNote'))
  const guideBefore = await getRequiredBox(smartGuide(page).first())
  await page.keyboard.up(primaryModifier())

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.keyboard.down(primaryModifier())
  await expect.poll(() => smartGuide(page).count()).toBeGreaterThan(0)
  const targetAfter = await getRequiredBox(selectedNode(page, 'workspaceFloatingNote'))
  const guideAfter = await getRequiredBox(smartGuide(page).first())
  await page.keyboard.up(primaryModifier())

  expect(Math.abs(targetAfter.x - targetBefore.x)).toBeGreaterThan(1)
  expect(Math.abs(guideAfter.x - guideBefore.x)).toBeGreaterThan(1)
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(selectedNode(page, nodeId)).toHaveAttribute(
    'data-selected',
    'true',
  )
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

async function readComputedPx(locator: Locator, property: 'left') {
  return locator.evaluate((element, styleProperty) =>
    Number.parseFloat(getComputedStyle(element)[styleProperty]), property)
}

function centerX(box: { width: number; x: number }) {
  return box.x + box.width / 2
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}

function moveable(page: Page) {
  return page.locator('.figma-dom-moveable')
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}

function selectedNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

function smartGuide(page: Page) {
  return page.locator('.figma-smart-guide')
}
