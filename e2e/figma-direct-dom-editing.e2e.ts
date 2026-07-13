import { expect, test, type Locator, type Page } from '@playwright/test'

const NESTED_SELECTION_PATH = [
  'workspacePage',
  'workspaceMain',
  'workspaceContent',
  'workspacePipeline',
  'workspacePipelineList',
] as const

test('selects canonical DOM nodes through canvas drill, exact hit, Layers, and Escape', async ({
  page,
}) => {
  await page.goto('/figma')

  const app = figmaApp(page)
  await expect(app).toHaveAttribute(
    'data-viewport-focus-node-id',
    'workspacePage',
  )
  const point = await centerPoint(designNode(page, 'workspacePipelineList'))

  for (const nodeId of NESTED_SELECTION_PATH) {
    await page.mouse.click(point.x, point.y)
    await expectSelectedNode(app, nodeId)
    await expectOverlayMatchesNode(
      selectionGuide(page),
      designNode(page, nodeId),
    )
  }

  await page.keyboard.press('Escape')
  await expectSelectedNode(app, 'workspacePipeline')

  const exactPoint = await centerPoint(
    designNode(page, 'workspacePipelineList'),
  )
  await page.keyboard.down(primaryModifier())
  await page.mouse.click(exactPoint.x, exactPoint.y)
  await page.keyboard.up(primaryModifier())
  await expectSelectedNode(app, 'workspaceDealTwo')

  await selectLayer(page, 'Hero actions', 'workspaceHeroActions')
  await expectOverlayMatchesNode(
    selectionGuide(page),
    designNode(page, 'workspaceHeroActions'),
  )

  await figmaCanvas(page).focus()
  await page.keyboard.press('Escape')
  await expectSelectedNode(app, 'workspaceHero')

  await selectLayer(page, 'Workspace page', 'workspacePage')
  await figmaCanvas(page).focus()
  await page.keyboard.press('Escape')
  await expect.poll(() => app.getAttribute('data-selected-node-id'))
    .toBeNull()
})

test('measures canonical DOM selection, box, flex, and grid overlays through projection', async ({
  page,
}) => {
  await page.goto('/figma')

  await selectLayer(page, 'Hero actions', 'workspaceHeroActions')
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(figmaApp(page)).toHaveAttribute(
    'data-affordance-mode',
    'measure',
  )
  await expect.poll(() => page.locator('.figma-guide-distance').count())
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Select tool' }).click()
  await expect(page.locator('.figma-autolayout-gap')).not.toHaveCount(0)
  await expectOverlayMatchesNode(
    selectionGuide(page),
    designNode(page, 'workspaceHeroActions'),
  )
  await page.getByRole('radio', { name: 'Vertical auto layout' }).click()
  await expectSelectedNode(figmaApp(page), 'workspaceHeroActions')
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('column')

  await selectLayer(page, 'Content grid', 'workspaceContent')
  await expect(page.locator('.figma-grid-line')).toHaveCount(0)
  await expect(page.locator('.figma-grid-gap')).not.toHaveCount(0)
  await page.locator('.figma-grid-gap').first().hover()
  await expect(page.locator('.figma-grid-line')).toHaveCount(1)
  await expectOverlayMatchesNode(
    selectionGuide(page),
    designNode(page, 'workspaceContent'),
  )

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expectOverlayMatchesNode(
    selectionGuide(page),
    designNode(page, 'workspaceContent'),
  )

  await selectLayer(page, 'Main area', 'workspaceMain')
  await page.getByRole('button', { name: 'Toggle box model X-ray' }).click()
  await expect(figmaApp(page)).toHaveAttribute(
    'data-affordance-mode',
    'xray',
  )
  await expect(page.locator(
    '[data-box-model-owner="selected"][data-box-model-layer="content"]',
  )).toHaveCount(1)
  await expect(page.locator(
    '[data-box-model-owner="selected"][data-box-model-layer="border"]',
  )).toHaveCount(1)
  await expect(page.locator(
    '[data-box-model-owner="selected"][data-box-model-layer="padding"]',
  )).not.toHaveCount(0)
})

test('edits canonical DOM layout and text through one history path', async ({
  page,
}) => {
  await page.goto('/figma')

  await selectLayer(page, 'Hero actions', 'workspaceHeroActions')
  await page.getByRole('radiogroup', { name: 'Direction' })
    .getByRole('radio', { name: 'V', exact: true })
    .click()
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('column')

  await selectLayer(page, 'Revenue label', 'workspaceStatRevenueLabel')
  const textEditor = page.getByRole('textbox', { name: 'Text' })
  await expect(textEditor).toHaveValue('Revenue')
  await textEditor.fill('Annual revenue')
  await expect(designNode(page, 'workspaceStatRevenueLabel'))
    .toContainText('Annual revenue')
  await expect(designNode(page, 'workspaceStatConversionLabel'))
    .toHaveText('Conversion')
  await expect(designNode(page, 'workspaceStatTicketsLabel'))
    .toHaveText('Open tickets')

  await page.getByRole('button', {
    name: 'Select layer Revenue label',
  }).click()
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(designNode(page, 'workspaceStatRevenueLabel'))
    .toContainText('Revenue')
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('column')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('row')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('column')
  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(designNode(page, 'workspaceStatRevenueLabel'))
    .toContainText('Annual revenue')
})

test('previews, cancels, commits, undoes, and redoes one atomic canonical DOM drag', async ({
  page,
}) => {
  await page.goto('/figma')

  const app = figmaApp(page)
  const note = designNode(page, 'workspaceFloatingNote')

  await selectLayer(page, 'Floating note', 'workspaceFloatingNote')
  const initialCanonicalX = await readNumericAttribute(
    app,
    'data-floating-note-x',
  )
  const initialRenderedX = await readComputedNumber(note, 'left')

  await startFloatingNoteDrag(page, note, { x: -36, y: 0 })
  await expect(app).toHaveAttribute(
    'data-preview-node-id',
    'workspaceFloatingNote',
  )
  await expect.poll(() => readComputedNumber(note, 'left'))
    .not.toBe(initialRenderedX)
  expect(await readNumericAttribute(app, 'data-floating-note-x'))
    .toBe(initialCanonicalX)

  await page.keyboard.press('Escape')
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())
  await expect.poll(() => readComputedNumber(note, 'left'))
    .toBe(initialRenderedX)
  await expect.poll(() => readNumericAttribute(app, 'data-floating-note-x'))
    .toBe(initialCanonicalX)
  await expect.poll(() => app.getAttribute('data-preview-node-id'))
    .toBeNull()

  await startFloatingNoteDrag(page, note, { x: -48, y: 0 })
  const previewRenderedX = await readComputedNumber(note, 'left')
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())
  await expect.poll(async () => Math.abs(
    await readNumericAttribute(app, 'data-floating-note-x') - previewRenderedX,
  )).toBeLessThanOrEqual(0.01)

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readNumericAttribute(app, 'data-floating-note-x'))
    .toBe(initialCanonicalX)
  await expect.poll(() => readComputedNumber(note, 'left'))
    .toBe(initialRenderedX)

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect.poll(async () => Math.abs(
    await readNumericAttribute(app, 'data-floating-note-x') - previewRenderedX,
  )).toBeLessThanOrEqual(0.01)
})

test('mounts usable resize handles and commits one canonical DOM resize', async ({
  page,
}) => {
  await page.goto('/figma')

  const app = figmaApp(page)
  const note = designNode(page, 'workspaceFloatingNote')

  await selectLayer(page, 'Floating note', 'workspaceFloatingNote')
  const initialWidth = await readComputedNumber(note, 'width')

  await page.keyboard.down(primaryModifier())
  const moveable = page.locator('.figma-dom-moveable')
  await expect(moveable).toBeVisible()
  const resizeHandle = moveable.locator(
    '.moveable-control[data-direction="se"]',
  )
  const handleBox = await requiredBox(resizeHandle)

  await page.mouse.move(
    handleBox.x + handleBox.width / 2,
    handleBox.y + handleBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    handleBox.x + handleBox.width / 2 + 24,
    handleBox.y + handleBox.height / 2 + 16,
    { steps: 4 },
  )
  await expect(app).toHaveAttribute(
    'data-preview-node-id',
    'workspaceFloatingNote',
  )
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())

  await expect.poll(() => readComputedNumber(note, 'width'))
    .toBeGreaterThan(initialWidth)
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedNumber(note, 'width'))
    .toBe(initialWidth)
})

test('previews spacing gestures, cancels cleanly, and commits one history entry', async ({
  page,
}) => {
  await page.goto('/figma')

  const app = figmaApp(page)
  const actions = designNode(page, 'workspaceHeroActions')

  await selectLayer(page, 'Hero actions', 'workspaceHeroActions')
  const initialGap = await readNumericAttribute(app, 'data-hero-actions-gap')
  const initialRenderedGap = await readComputedNumber(actions, 'columnGap')
  const gapHandle = page.locator('.figma-autolayout-gap').first()

  await dragHandle(page, gapHandle, { x: 24, y: 0 })
  await expect(app).toHaveAttribute(
    'data-preview-node-id',
    'workspaceHeroActions',
  )
  await expect.poll(() => readComputedNumber(actions, 'columnGap'))
    .toBeGreaterThan(initialRenderedGap)
  expect(await readNumericAttribute(app, 'data-hero-actions-gap'))
    .toBe(initialGap)

  await dispatchPointerCancel(page)
  await page.mouse.up()
  await expect.poll(() => readComputedNumber(actions, 'columnGap'))
    .toBe(initialRenderedGap)
  await expect.poll(() => readNumericAttribute(app, 'data-hero-actions-gap'))
    .toBe(initialGap)
  await expect(app).toHaveAttribute('data-history-can-undo', 'false')

  await dragHandle(page, gapHandle, { x: 32, y: 0 })
  const previewGap = await readComputedNumber(actions, 'columnGap')
  await page.mouse.up()
  await expect.poll(() => readNumericAttribute(app, 'data-hero-actions-gap'))
    .toBeCloseTo(previewGap, 4)
  await expect(app).toHaveAttribute('data-history-can-undo', 'true')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedNumber(actions, 'columnGap'))
    .toBe(initialRenderedGap)
  await expect(app).toHaveAttribute('data-history-can-undo', 'false')

  const initialPadding = await readNumericAttribute(
    app,
    'data-hero-actions-padding-right',
  )
  const initialRenderedPadding = await readComputedNumber(
    actions,
    'paddingRight',
  )
  const paddingHandle = page.locator(
    '[data-dom-edit-padding-kind="padding-right"]',
  )

  await dragHandle(page, paddingHandle, { x: 20, y: 0 })
  await expect(app).toHaveAttribute(
    'data-preview-node-id',
    'workspaceHeroActions',
  )
  await dispatchPointerCancel(page)
  await page.mouse.up()
  await expect.poll(() => readComputedNumber(actions, 'paddingRight'))
    .toBe(initialRenderedPadding)
  await expect.poll(() => readNumericAttribute(
    app,
    'data-hero-actions-padding-right',
  )).toBe(initialPadding)
  await expect(app).toHaveAttribute('data-history-can-undo', 'false')

  await selectLayer(page, 'Content grid', 'workspaceContent')
  const content = designNode(page, 'workspaceContent')
  const initialGridGap = await readComputedNumber(content, 'columnGap')
  const gridGapHandle = page.locator('.figma-grid-gap--column').first()

  await dragHandle(page, gridGapHandle, { x: 20, y: 0 })
  await expect(app).toHaveAttribute(
    'data-preview-node-id',
    'workspaceContent',
  )
  await dispatchPointerCancel(page)
  await page.mouse.up()
  await expect.poll(() => readComputedNumber(content, 'columnGap'))
    .toBe(initialGridGap)
  await expect(app).toHaveAttribute('data-history-can-undo', 'false')

  await dragHandle(page, gridGapHandle, { x: 20, y: 0 })
  await page.mouse.up()
  await expect.poll(() => readComputedNumber(content, 'columnGap'))
    .toBeGreaterThan(initialGridGap)
  await expect(app).toHaveAttribute('data-history-can-undo', 'true')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedNumber(content, 'columnGap'))
    .toBe(initialGridGap)
  await expect(app).toHaveAttribute('data-history-can-undo', 'false')
})

test('contains editor shortcuts and composition inside the native text editor', async ({
  page,
}) => {
  await page.goto('/figma')

  const app = figmaApp(page)

  await selectLayer(page, 'Hero actions', 'workspaceHeroActions')
  await page.getByRole('radiogroup', { name: 'Direction' })
    .getByRole('radio', { name: 'V', exact: true })
    .click()
  await selectLayer(page, 'Revenue label', 'workspaceStatRevenueLabel')

  const textEditor = page.getByRole('textbox', { name: 'Text' })
  await textEditor.focus()
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('column')

  await textEditor.dispatchEvent('keydown', { key: 'x' })
  await expect(page.getByRole('button', {
    name: 'Toggle box model X-ray',
  })).toHaveAttribute('aria-pressed', 'false')
  await expectSelectedNode(app, 'workspaceStatRevenueLabel')

  await textEditor.dispatchEvent('compositionstart', { data: '한' })
  await textEditor.dispatchEvent('keydown', {
    isComposing: true,
    key: 'Escape',
  })
  await expectSelectedNode(app, 'workspaceStatRevenueLabel')
  await textEditor.dispatchEvent('compositionend', { data: '한' })

  await page.getByRole('button', {
    name: 'Select layer Hero actions',
  }).click()
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedStyle(
    designNode(page, 'workspaceHeroActions'),
    'flexDirection',
  )).toBe('row')
})

async function selectLayer(
  page: Page,
  label: string,
  nodeId: string,
) {
  const layer = page.getByRole('button', { name: `Select layer ${label}` })

  if (await layer.count() === 0) {
    await page.getByRole('button', { name: 'Select layer Workspace page' })
      .click()
  }

  await layer.click()
  await expectSelectedNode(figmaApp(page), nodeId)
}

async function expectSelectedNode(app: Locator, nodeId: string) {
  await expect(app).toHaveAttribute('data-selected-node-id', nodeId)
}

async function expectOverlayMatchesNode(
  overlay: Locator,
  node: Locator,
) {
  const [overlayBox, nodeBox] = await Promise.all([
    requiredBox(overlay),
    requiredBox(node),
  ])

  expectClose(overlayBox.x, nodeBox.x)
  expectClose(overlayBox.y, nodeBox.y)
  expectClose(overlayBox.width, nodeBox.width)
  expectClose(overlayBox.height, nodeBox.height)
}

async function startFloatingNoteDrag(
  page: Page,
  note: Locator,
  delta: { x: number; y: number },
) {
  await page.keyboard.down(primaryModifier())
  await expect(page.locator('.figma-dom-moveable')).toHaveCount(1)

  const box = await requiredBox(note)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

async function dragHandle(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await requiredBox(handle)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

async function dispatchPointerCancel(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent('pointercancel', {
      bubbles: true,
      pointerId: 1,
    }))
  })
}

async function centerPoint(locator: Locator) {
  const box = await requiredBox(locator)

  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  }
}

async function requiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

async function readComputedStyle(
  locator: Locator,
  property: 'flexDirection',
) {
  return locator.evaluate(
    (element, propertyName) => getComputedStyle(element)[propertyName],
    property,
  )
}

async function readComputedNumber(
  locator: Locator,
  property: 'columnGap' | 'left' | 'paddingRight' | 'width',
) {
  return locator.evaluate(
    (element, propertyName) =>
      Number.parseFloat(getComputedStyle(element)[propertyName]),
    property,
  )
}

async function readNumericAttribute(locator: Locator, name: string) {
  const value = await locator.getAttribute(name)
  const number = Number(value)

  if (value === null || !Number.isFinite(number)) {
    throw new Error(`Missing numeric ${name}: ${value}`)
  }

  return number
}

function selectionGuide(page: Page) {
  return page.locator('.figma-guide-selected')
}

function designNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

function figmaApp(page: Page) {
  return page.locator('.figma-clone')
}

function figmaCanvas(page: Page) {
  return page.getByRole('region', { name: 'Canvas' })
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
