import { expect, test, type Locator, type Page } from '@playwright/test'

const SELECTION_CASES = [
  {
    buttonName: 'Select layer Workspace page',
    label: 'Workspace page',
    nodeId: 'workspacePage',
    parentOutline: false,
  },
  {
    buttonName: 'Select layer Main area',
    label: 'Main area',
    nodeId: 'workspaceMain',
    parentOutline: true,
  },
  {
    buttonName: 'Select layer Pipeline list',
    label: 'Pipeline list',
    nodeId: 'workspacePipelineList',
    parentOutline: true,
  },
] as const

test('normalizes the DOM selection guide layer', async ({ page }) => {
  await page.goto('/?demo=figma')

  for (const selection of SELECTION_CASES) {
    await selectLayer(page, selection.buttonName, selection.nodeId)
    await expectSelectionIdentity(page, selection)
  }
})

test('keeps selected DOM guide aligned while panning', async ({ page }) => {
  await page.goto('/?demo=figma')
  await selectLayer(
    page,
    'Select layer Workspace page',
    'workspacePage',
  )
  await selectLayer(
    page,
    'Select layer Pipeline list',
    'workspacePipelineList',
  )

  const beforeNode = await getRequiredBox(domNode(page, 'workspacePipelineList'))
  const beforeGuide = await getRequiredBox(selectionGuide(page))

  await page.keyboard.press('h')
  await expect(page.locator('.canvas-stage')).toHaveAttribute('data-mode', 'pan')
  await panCanvas(page, { x: 48, y: 24 })

  await expect.poll(async () => {
    const afterNode = await getRequiredBox(domNode(page, 'workspacePipelineList'))

    return Math.abs(afterNode.x - beforeNode.x) +
      Math.abs(afterNode.y - beforeNode.y)
  }).toBeGreaterThan(1)

  const afterNode = await getRequiredBox(domNode(page, 'workspacePipelineList'))
  const afterGuide = await getRequiredBox(selectionGuide(page))

  expectClose(afterGuide.x - beforeGuide.x, afterNode.x - beforeNode.x)
  expectClose(afterGuide.y - beforeGuide.y, afterNode.y - beforeNode.y)
  await expectOverlayMatchesNode(page, 'workspacePipelineList')

  await page.keyboard.press('v')
})

test('keeps widget selection separate from DOM edit selection', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(selectionGuide(page)).toHaveCount(1)

  await page.getByRole('button', { name: 'Select React widget frame' }).click()

  await expect(selectionGuide(page)).toHaveCount(0)
  await expect(page.locator('.figma-guide-label')).toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('[data-figma-dom-node][data-selected="true"]'))
    .toHaveCount(0)
  await expect(
    page.getByRole('complementary', { name: 'CSS Inspector' })
      .getByRole('heading', { name: 'React widget' }),
  ).toBeVisible()
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(domNode(page, nodeId)).toHaveAttribute('data-selected', 'true')
}

async function expectSelectionIdentity(
  page: Page,
  selection: typeof SELECTION_CASES[number],
) {
  await expect(selectionGuide(page)).toHaveCount(1)
  await expectOverlayMatchesNode(page, selection.nodeId)
  await expect(page.locator('.figma-guide-label')).toContainText(
    selection.label,
  )
  await expect(page.locator('.figma-guide-label')).not.toContainText(
    /W \d+|H \d+|Fill|Hug|Fixed/,
  )
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(sizeModeControl(page, 0)).toHaveAttribute(
    'aria-label',
    /W \d+ (Fill|Fixed|Hug)/,
  )
  await expect(sizeModeControl(page, 1)).toHaveAttribute(
    'aria-label',
    /H \d+ (Fill|Fixed|Hug)/,
  )
  await expect(page.locator('.figma-guide-parent')).toHaveCount(
    selection.parentOutline ? 1 : 0,
  )
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
}

async function expectOverlayMatchesNode(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(selectionGuide(page))

  expectClose(guideBox.x, nodeBox.x)
  expectClose(guideBox.y, nodeBox.y)
  expectClose(guideBox.width, nodeBox.width)
  expectClose(guideBox.height, nodeBox.height)
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

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}

function selectionGuide(page: Page) {
  return page.locator('.figma-guide-selected')
}

function sizeModeControl(page: Page, index: number) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .nth(index)
}
