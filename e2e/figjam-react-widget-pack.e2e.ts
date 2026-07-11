import { expect, test, type Locator, type Page } from '@playwright/test'

test('creates, transforms, directly edits, and restores a React sticky note', async ({
  page,
}) => {
  await page.goto('/figjam-widgets')

  const app = fixture(page)

  await page.getByRole('button', { name: 'Sticky note', exact: true }).click()
  await expect(app).toHaveAttribute('data-sticky-count', '1')
  await expect(app).toHaveAttribute('data-selected-node-id', 'sticky-1')

  const sticky = designNode(page, 'sticky-1')
  const initialText = 'Write something…'

  await expect(sticky).toContainText(initialText)
  expect(await sticky.evaluate((element) => element.tagName)).toBe('ARTICLE')
  await expectAuthoredDomHasNoCanvasEnvelope(page)

  await expectMoveUndoRedo(page, sticky, { x: 42, y: 24 })
  await expectResizeUndoRedo(page, sticky, { x: 34, y: 20 })

  await sticky.dblclick({ force: true })
  const editor = page.getByRole('textbox', { name: 'Edit sticky note text' })

  await expect(editor).toBeVisible()
  await editor.click()
  await expect(app).toHaveAttribute('data-selected-node-id', 'sticky-1')
  await editor.fill('Cancelled draft')
  await expect(app).toHaveAttribute('data-preview-node-id', 'sticky-1')
  await expect(sticky).toContainText('Cancelled draft')
  await page.keyboard.press('Escape')
  await expect(editor).toHaveCount(0)
  await expect(sticky).toContainText(initialText)
  await expect.poll(() => app.getAttribute('data-preview-node-id')).toBeNull()

  await sticky.dblclick({ force: true })
  const committedEditor = page.getByRole('textbox', {
    name: 'Edit sticky note text',
  })

  await committedEditor.fill('Ship the DOM widget')
  await page.keyboard.press(`${primaryModifier()}+Enter`)
  await expect(committedEditor).toHaveCount(0)
  await expect(sticky).toContainText('Ship the DOM widget')

  await undo(page)
  await expect(sticky).toContainText(initialText)
  await redo(page)
  await expect(sticky).toContainText('Ship the DOM widget')
})

test('creates, transforms, styles, and restores a bounded React shape', async ({
  page,
}) => {
  await page.goto('/figjam-widgets')

  const app = fixture(page)

  await page.getByRole('button', { name: 'Shape', exact: true }).click()
  await expect(app).toHaveAttribute('data-shape-count', '1')
  await expect(app).toHaveAttribute('data-selected-node-id', 'shape-1')

  const shape = designNode(page, 'shape-1')

  expect(await shape.evaluate((element) => element.tagName)).toBe('DIV')
  await expect(shape.locator('svg')).toHaveCount(1)
  await expectAuthoredDomHasNoCanvasEnvelope(page)

  await expectMoveUndoRedo(page, shape, { x: 36, y: -22 })
  await expectResizeUndoRedo(page, shape, { x: 28, y: 30 })

  const fill = page.getByRole('combobox', { name: 'Shape fill' })

  await expect(fill).toHaveValue('blue')
  await fill.selectOption('coral')
  await expect(shape).toHaveAttribute('data-shape-fill', 'coral')
  await undo(page)
  await expect(shape).toHaveAttribute('data-shape-fill', 'blue')
  await redo(page)
  await expect(shape).toHaveAttribute('data-shape-fill', 'coral')
})

async function expectMoveUndoRedo(
  page: Page,
  node: Locator,
  delta: { readonly x: number; readonly y: number },
) {
  const initialLeft = await readComputedNumber(node, 'left')
  const initialTop = await readComputedNumber(node, 'top')

  await page.keyboard.down(primaryModifier())
  await expect(page.locator('.figma-dom-moveable')).toHaveCount(1)
  const box = await requiredBox(node)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())

  const movedLeft = await readComputedNumber(node, 'left')
  const movedTop = await readComputedNumber(node, 'top')

  expect(Math.abs(movedLeft - initialLeft) + Math.abs(movedTop - initialTop))
    .toBeGreaterThan(1)
  await undo(page)
  await expect.poll(() => readComputedNumber(node, 'left')).toBe(initialLeft)
  await expect.poll(() => readComputedNumber(node, 'top')).toBe(initialTop)
  await redo(page)
  await expect.poll(() => readComputedNumber(node, 'left')).toBe(movedLeft)
  await expect.poll(() => readComputedNumber(node, 'top')).toBe(movedTop)
}

async function expectResizeUndoRedo(
  page: Page,
  node: Locator,
  delta: { readonly x: number; readonly y: number },
) {
  const initialWidth = await readComputedNumber(node, 'width')
  const initialHeight = await readComputedNumber(node, 'height')

  await page.keyboard.down(primaryModifier())
  const moveable = page.locator('.figma-dom-moveable')
  const handle = moveable.locator('.moveable-control[data-direction="se"]')
  const box = await requiredBox(handle)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())

  const resizedWidth = await readComputedNumber(node, 'width')
  const resizedHeight = await readComputedNumber(node, 'height')

  expect(resizedWidth).toBeGreaterThan(initialWidth)
  expect(resizedHeight).toBeGreaterThan(initialHeight)
  await undo(page)
  await expect.poll(() => readComputedNumber(node, 'width')).toBe(initialWidth)
  await expect.poll(() => readComputedNumber(node, 'height')).toBe(initialHeight)
  await redo(page)
  await expect.poll(() => readComputedNumber(node, 'width')).toBe(resizedWidth)
  await expect.poll(() => readComputedNumber(node, 'height')).toBe(resizedHeight)
}

async function expectAuthoredDomHasNoCanvasEnvelope(page: Page) {
  const board = designNode(page, 'figjam-widget-board')

  await expect(board.locator('canvas, foreignObject')).toHaveCount(0)
  await expect(page.locator('[data-canvas-item-id]')).toHaveCount(0)
}

async function undo(page: Page) {
  await page.getByRole('button', { name: 'Undo widget edit' }).click()
}

async function redo(page: Page) {
  await page.getByRole('button', { name: 'Redo widget edit' }).click()
}

function fixture(page: Page) {
  return page.locator('.figjam-widget-fixture')
}

function designNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

async function requiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

async function readComputedNumber(
  locator: Locator,
  property: 'height' | 'left' | 'top' | 'width',
) {
  return locator.evaluate((element, name) =>
    Number.parseFloat(getComputedStyle(element)[name]), property)
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
