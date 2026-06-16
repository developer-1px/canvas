import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows parent and sibling smart guides only in guide states', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Revenue stat', 'workspaceStatRevenue')

  await expect(smartGuide(page)).toHaveCount(0)
  await expect(moveable(page)).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(parentEdgeGuide(page)).toHaveCount(1)
  await expect(siblingEdgeGuide(page)).toHaveCount(1)
  await expect(siblingCenterGuide(page)).toHaveCount(1)
  await expect(moveable(page)).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(smartGuide(page)).toHaveCount(0)
})

test('keeps smart edge and center guides aligned through pan and zoom', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Revenue stat', 'workspaceStatRevenue')
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(parentEdgeGuide(page)).toHaveCount(1)
  await expect(siblingCenterGuide(page)).toHaveCount(1)
  await expectSmartGuidesMatchSelected(page)

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expectSmartGuidesMatchSelected(page)

  const beforeNode = await getRequiredBox(domNode(page, 'workspaceStatRevenue'))
  await page.keyboard.press('h')
  await expect(page.locator('.canvas-stage')).toHaveAttribute(
    'data-mode',
    'pan',
  )
  await panCanvas(page, { x: 56, y: 28 })
  await expect.poll(async () => {
    const afterNode = await getRequiredBox(domNode(page, 'workspaceStatRevenue'))

    return Math.abs(afterNode.x - beforeNode.x) +
      Math.abs(afterNode.y - beforeNode.y)
  }).toBeGreaterThan(1)
  await expectSmartGuidesMatchSelected(page)
  await page.keyboard.press('v')
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(domNode(page, nodeId)).toHaveAttribute('data-selected', 'true')
}

async function expectSmartGuidesMatchSelected(page: Page) {
  const selectedBox = await getRequiredBox(domNode(page, 'workspaceStatRevenue'))
  const parentEdgeBox = await getRequiredBox(parentEdgeGuide(page))
  const siblingEdgeBox = await getRequiredBox(siblingEdgeGuide(page))
  const siblingCenterBox = await getRequiredBox(siblingCenterGuide(page))

  expectClose(centerX(parentEdgeBox), selectedBox.x)
  expectClose(centerY(siblingEdgeBox), selectedBox.y)
  expectClose(centerY(siblingCenterBox), centerY(selectedBox))
}

async function panCanvas(
  page: Page,
  delta: { x: number; y: number },
) {
  const stageBox = await getRequiredBox(page.locator('.canvas-stage'))
  const x = stageBox.x + 120
  const y = stageBox.y + 120

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 6 })
  await page.mouse.up()
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function domNode(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`)
}

function moveable(page: Page) {
  return page.locator('.figma-dom-moveable')
}

function parentEdgeGuide(page: Page) {
  return smartGuide(page, {
    axis: 'x',
    point: 'edge',
    source: 'parent',
    target: 'left',
  })
}

function siblingCenterGuide(page: Page) {
  return smartGuide(page, {
    axis: 'y',
    point: 'center',
    source: 'sibling',
    target: 'center-y',
  })
}

function siblingEdgeGuide(page: Page) {
  return smartGuide(page, {
    axis: 'y',
    point: 'edge',
    source: 'sibling',
    target: 'top',
  })
}

function smartGuide(
  page: Page,
  filters: {
    axis?: 'x' | 'y'
    point?: 'center' | 'edge' | 'spacing'
    source?: 'parent' | 'sibling'
    target?: string
  } = {},
) {
  const axisSelector = filters.axis
    ? `[data-smart-guide-axis="${filters.axis}"]`
    : ''
  const pointSelector = filters.point
    ? `[data-smart-guide-point="${filters.point}"]`
    : ''
  const sourceSelector = filters.source
    ? `[data-smart-guide-source="${filters.source}"]`
    : ''
  const targetSelector = filters.target
    ? `[data-smart-guide-target="${filters.target}"]`
    : ''

  return page.locator(
    `.figma-smart-guide${axisSelector}${pointSelector}${sourceSelector}${targetSelector}`,
  )
}

function centerX(box: { width: number; x: number }) {
  return box.x + box.width / 2
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}
