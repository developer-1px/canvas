import { expect, test, type Locator, type Page } from '@playwright/test'

const NESTED_SELECTION_PATH = [
  ['Workspace page', 'workspacePage'],
  ['Main area', 'workspaceMain'],
  ['Content grid', 'workspaceContent'],
  ['Pipeline panel', 'workspacePipeline'],
  ['Pipeline list', 'workspacePipelineList'],
] as const

test('verifies default selection and nested click descent in the preview', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')

  await expect(selectionGuide(page)).toHaveCount(1)
  await expectSelectionMatchesNode(page, 'workspacePage')
  await expect(page.locator('.figma-guide-label')).toContainText(
    'Workspace page',
  )
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)
  await expect(moveable(page)).toHaveCount(0)

  const pipelineList = domNode(page, 'workspacePipelineList')
  const point = await getCenterPoint(pipelineList)

  for (const [label, nodeId] of NESTED_SELECTION_PATH.slice(1)) {
    await page.mouse.click(point.x, point.y)
    await expect(domNode(page, nodeId)).toHaveAttribute(
      'data-selected',
      'true',
    )
    await expectSelectedLayer(page, label, nodeId)
    await expect(page.locator('.figma-guide-label')).toContainText(label)
    await expectSelectionMatchesNode(page, nodeId)
  }

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expectSelectedLayer(page, 'Hero title', 'workspaceHeroTitle')
  await expectSelectionMatchesNode(page, 'workspaceHeroTitle')
})

test('preserves authored node identities and DOM semantics across document edits', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')

  const initialNodeIds = await expectStableAuthoredDom(page)

  await page.getByRole('spinbutton', { name: 'Pad' }).fill('28')
  await expect.poll(() => readPaddingTop(page, 'workspacePage')).toBe(28)

  expect(await expectStableAuthoredDom(page)).toEqual(initialNodeIds)
})

test('verifies measure and X-ray overlays stay state-specific', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Hero panel', 'workspaceHero')

  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-guide-distance').count())
    .toBeGreaterThan(0)
  await expectDistanceIsMeasureRed(page.locator('.figma-guide-distance').first())
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await page.getByRole('spinbutton', { name: 'Mar' }).fill('12')
  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(selectedBoxModelLayer(page, 'content')).toHaveCount(1)
  await expect(selectedBoxModelLayer(page, 'border')).toHaveCount(1)
  await expect(selectedBoxModelLayer(page, 'padding')).toHaveCount(4)
  await expect(selectedBoxModelLayer(page, 'margin')).toHaveCount(4)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)

  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(page.locator('.figma-boxmodel-layer')).toHaveCount(0)
})

test('verifies flex spacing and flex-child participation controls', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  await expect(page.locator('.figma-autolayout-gap--column')).toHaveCount(2)
  const initialGap = await readFlexGap(page, 'workspacePipelineList')
  const initialGapBoxes = await readBoxes(
    page.locator('.figma-autolayout-gap--column'),
  )

  await dragHandle(page, page.locator('.figma-autolayout-gap--column').first(), {
    x: 0,
    y: 18,
  })

  await expect.poll(() => readFlexGap(page, 'workspacePipelineList'))
    .toBeGreaterThan(initialGap)
  const updatedGapBoxes = await readBoxes(
    page.locator('.figma-autolayout-gap--column'),
  )
  expect(updatedGapBoxes).toHaveLength(initialGapBoxes.length)
  for (const [index, box] of updatedGapBoxes.entries()) {
    expect(box.height).toBeGreaterThan(initialGapBoxes[index].height)
  }

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  const initialPaddingHeight = await readBoxHeight(sideHandle(page, 'top'))
  await page.getByRole('spinbutton', { name: 'Pad' }).fill('36')
  await expect.poll(() => readBoxHeight(sideHandle(page, 'top')))
    .toBeGreaterThan(initialPaddingHeight + 2)

  await startDrag(page, sideHandle(page, 'top'), { x: 0, y: 16 })
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await page.mouse.up()

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await startDrag(page, page.locator('.figma-autolayout-gap').first(), {
    x: 16,
    y: 0,
  })
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await page.mouse.up()

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await expect(widthModeBadge(page)).toHaveAttribute('aria-label', /W \d+ Fill/)
  await expect(flexChildAlignSelf(page)).toHaveCount(1)
  await widthModeBadge(page).hover()
  await expect(sizeOption(page, 'W Fill')).toBeVisible()
  await expect(sizeOption(page, 'W Hug')).toBeVisible()
  await expect(sizeOption(page, 'W Fixed')).toBeVisible()
})

test('verifies grid and out-of-flow affordances in the preview', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')

  await expect(gridLine(page, 'column')).toHaveCount(0)
  await expect(gridLine(page, 'row')).toHaveCount(0)
  await expect.poll(() => page.locator('.figma-grid-gap').count())
    .toBeGreaterThan(0)
  await page.locator('.figma-grid-gap').first().hover()
  await expect(page.locator('.figma-grid-line')).toHaveCount(1)

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)
  await expect(page.locator('.figma-grid-gap')).toHaveCount(0)

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await page.keyboard.down(primaryModifier())
  await expect(moveable(page)).toHaveCount(0)
  await page.keyboard.up(primaryModifier())

  await selectLayer(page, 'Select layer Floating note', 'workspaceFloatingNote')
  await page.keyboard.down(primaryModifier())
  await expect(moveable(page)).toHaveCount(1)
  await expect(page.locator('.moveable-control')).not.toHaveCount(0)
  await expect(page.locator('[data-dom-layout-context-badge="absolute"]'))
    .toHaveCount(1)
  await page.keyboard.up(primaryModifier())
})

test('verifies selected overlay tracking through pan and zoom', async ({
  page,
}) => {
  await page.goto('/figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  await expectSelectionMatchesNode(page, 'workspaceContent')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expectSelectionMatchesNode(page, 'workspaceContent')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)

  const beforeNode = await getRequiredBox(domNode(page, 'workspaceContent'))
  await page.keyboard.press('h')
  await expect(page.locator('.figma-direct-dom__stage')).toHaveAttribute(
    'data-mode',
    'pan',
  )
  await panCanvas(page, { x: 56, y: 28 })

  await expect.poll(async () => {
    const afterNode = await getRequiredBox(domNode(page, 'workspaceContent'))

    return Math.abs(afterNode.x - beforeNode.x) +
      Math.abs(afterNode.y - beforeNode.y)
  }).toBeGreaterThan(1)
  await expectSelectionMatchesNode(page, 'workspaceContent')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)
  await page.keyboard.press('v')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'select')
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(domNode(page, nodeId)).toHaveAttribute('data-selected', 'true')
}

async function expectSelectedLayer(
  page: Page,
  label: string,
  nodeId: string,
) {
  const tree = page.getByRole('tree', { name: 'Layers' })
  const treeItem = tree.getByRole('treeitem', { name: label, exact: true })
  const layerButton = page.getByRole('button', {
    name: `Select layer ${label}`,
  })

  await expect(treeItem).toHaveAttribute('aria-selected', 'true')
  await expect(layerButton).toHaveAttribute('data-figma-layer-node-id', nodeId)
  await expect(layerButton).toHaveAttribute('tabindex', '0')
  await expect(tree.locator('[role="treeitem"][aria-selected="true"]'))
    .toHaveCount(1)
}

async function expectStableAuthoredDom(page: Page) {
  const nodeIds = await page
    .locator('[data-design-node-id^="workspace"]')
    .evaluateAll(
      (elements) => elements.map((element) =>
        element.getAttribute('data-design-node-id') ?? ''),
    )

  expect(nodeIds.length).toBeGreaterThan(0)
  expect(nodeIds.every(Boolean)).toBe(true)
  expect(new Set(nodeIds).size).toBe(nodeIds.length)

  for (const [nodeId, tagName] of [
    ['workspacePage', 'SECTION'],
    ['workspaceMain', 'MAIN'],
    ['workspaceHeroTitle', 'H2'],
    ['workspacePrimaryAction', 'BUTTON'],
  ] as const) {
    const node = page.locator(`[data-design-node-id="${nodeId}"]`)
    await expect(node).toHaveCount(1)
    await expect.poll(() => node.evaluate((element) => element.tagName))
      .toBe(tagName)
  }

  return [...nodeIds].sort()
}

async function readPaddingTop(page: Page, nodeId: string) {
  return domNode(page, nodeId).evaluate((element) =>
    Math.round(Number.parseFloat(getComputedStyle(element).paddingTop)))
}

async function expectSelectionMatchesNode(page: Page, nodeId: string) {
  await expectOverlayMatchesNode(selectionGuide(page), domNode(page, nodeId))
}

async function expectOverlayMatchesNode(
  overlay: Locator,
  node: Locator,
) {
  const overlayBox = await getRequiredBox(overlay)
  const nodeBox = await getRequiredBox(node)

  expectClose(overlayBox.x, nodeBox.x)
  expectClose(overlayBox.y, nodeBox.y)
  expectClose(overlayBox.width, nodeBox.width)
  expectClose(overlayBox.height, nodeBox.height)
}

async function expectDistanceIsMeasureRed(locator: Locator) {
  await expect.poll(() =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor)
  ).toBe('rgb(220, 38, 38)')
}

async function dragHandle(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  await startDrag(page, handle, delta)
  await page.mouse.up()
}

async function startDrag(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await getRequiredBox(handle)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

async function panCanvas(
  page: Page,
  delta: { x: number; y: number },
) {
  const stageBox = await getRequiredBox(
    page.locator('.figma-direct-dom__stage'),
  )
  const x = stageBox.x + 120
  const y = stageBox.y + 120

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 6 })
  await page.mouse.up()
}

async function getCenterPoint(locator: Locator) {
  const box = await getRequiredBox(locator)

  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  }
}

async function readBoxes(locator: Locator) {
  return locator.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect()

      return {
        height: rect.height,
        width: rect.width,
        x: rect.x,
        y: rect.y,
      }
    }))
}

async function readBoxHeight(locator: Locator) {
  const box = await getRequiredBox(locator)

  return box.height
}

async function readFlexGap(page: Page, nodeId: string) {
  return domNode(page, nodeId).evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).rowGap))
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function domNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

function flexChildAlignSelf(page: Page) {
  return page.locator('.figma-flex-child-align-self')
}

function gridLine(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-grid-line-axis="${axis}"]`)
}

function moveable(page: Page) {
  return page.locator('.figma-dom-moveable')
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}

function selectedBoxModelLayer(page: Page, layer: string) {
  return page.locator(
    `.figma-boxmodel-layer[data-box-model-owner="selected"][data-box-model-layer="${layer}"]`,
  )
}

function selectionGuide(page: Page) {
  return page.locator('.figma-guide-selected')
}

function sideHandle(page: Page, side: 'bottom' | 'left' | 'right' | 'top') {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}

function sizeOption(page: Page, label: string) {
  return page.locator(
    `.figma-size-mode-control__choices button[aria-label="${label}"]`,
  )
}

function widthModeBadge(page: Page) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .first()
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}
