import { expect, test, type Locator, type Page } from '@playwright/test'

const FIGJAM_STORAGE_KEY =
  '@interactive-os/canvas/figjam-react-document/v1'

test('renders the canonical FigJam document as direct React DOM', async ({
  page,
}) => {
  await page.goto('/figjam')

  const app = figJamApp(page)
  const board = designNode(page, 'figjam-board')

  await expect(app).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'FigJam tools' }))
    .toBeVisible()
  await expect(board).toHaveAttribute('data-figjam-structure', 'board')
  await expect(designNode(page, 'figjam-section'))
    .toHaveAttribute('data-figjam-structure', 'section')
  await expectSeedFamily(page, 'sticky-note', 3)
  await expectSeedFamily(page, 'shape', 3)
  await expectSeedFamily(page, 'text', 1)
  await expectSeedFamily(page, 'drawing', 2)
  await expectSeedFamily(page, 'connector', 2)
  await expectSeedFamily(page, 'image', 1)
  await expectSeedFamily(page, 'stamp', 2)

  expect(await board.evaluate((element) => element.tagName)).toBe('SECTION')
  expect(await designNode(page, 'figjam-sticky').evaluate(
    (element) => element.tagName,
  )).toBe('ARTICLE')
  await expect(page.locator('canvas, foreignObject')).toHaveCount(0)
  await expect(page.locator('[data-canvas-item-id]')).toHaveCount(0)

  await page.goto('/figjam-widgets')
  await expect(page.getByRole('main', { name: 'Choose a canvas' }))
    .toBeVisible()
  await expect(page.locator('.figjam-widget-fixture')).toHaveCount(0)

  await page.goto('/engine')
  await expect(page.getByRole('toolbar', { name: 'Engine affordances' }))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id]')).not.toHaveCount(0)
  await expect(page.locator('.figjam-react-app')).toHaveCount(0)
})

test('creates toolbar families and supports direct, additive, marquee, and grouped selection', async ({
  page,
}) => {
  await page.goto('/figjam')

  const stage = figJamStage(page)
  const stageBox = await requiredBox(stage)
  const insertionPoints = [
    { x: stageBox.x + stageBox.width * 0.68, y: stageBox.y + stageBox.height * 0.76 },
    { x: stageBox.x + stageBox.width * 0.76, y: stageBox.y + stageBox.height * 0.84 },
    { x: stageBox.x + stageBox.width * 0.84, y: stageBox.y + stageBox.height * 0.74 },
    { x: stageBox.x + stageBox.width * 0.9, y: stageBox.y + stageBox.height * 0.86 },
    { x: stageBox.x + stageBox.width * 0.72, y: stageBox.y + stageBox.height * 0.64 },
  ]
  const creations = [
    { button: 'Shape tool', locator: page.locator('[data-figjam-widget="shape"]') },
    { button: 'Text tool', locator: page.locator('[data-figjam-widget="text"]') },
    { button: 'Sticky note tool', locator: page.locator('[data-figjam-widget="sticky-note"]') },
    { button: 'Comment tool', locator: page.locator('[data-figjam-widget="comment"]') },
    { button: 'Section tool', locator: page.locator('[data-figjam-structure="section"]') },
  ] as const

  for (const [index, creation] of creations.entries()) {
    const initialCount = await creation.locator.count()

    await page.getByRole('button', { name: creation.button }).click()
    await page.mouse.click(insertionPoints[index]!.x, insertionPoints[index]!.y)
    await expect(creation.locator).toHaveCount(initialCount + 1)
    await expect(creation.locator.last()).toHaveAttribute('data-selected', 'true')
  }

  await page.getByRole('button', { name: 'Select tool' }).click()
  const first = designNode(page, 'figjam-sticky')
  const second = designNode(page, 'figjam-sticky-next')

  await first.click()
  await expectSelection(page, ['figjam-sticky'])
  await second.click({ modifiers: ['Shift'] })
  await expectSelection(page, ['figjam-sticky', 'figjam-sticky-next'])
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toContainText('2 objects')

  await page.getByRole('button', { name: 'Group', exact: true }).click()
  await expect(page.locator('[data-figjam-structure="group"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.locator('[data-figjam-structure="group"]')).toHaveCount(0)

  const boardBox = await requiredBox(designNode(page, 'figjam-board'))
  const secondBox = await requiredBox(second)
  const start = {
    x: Math.max(stageBox.x + 2, boardBox.x - 18),
    y: Math.max(stageBox.y + 2, boardBox.y - 18),
  }

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(
    secondBox.x + secondBox.width + 8,
    secondBox.y + secondBox.height + 8,
    { steps: 8 },
  )
  await expect(page.locator('[data-figjam-marquee]')).toBeVisible()
  await page.mouse.up()

  await expect(first).toHaveAttribute('data-selected', 'true')
  await expect(second).toHaveAttribute('data-selected', 'true')
  await expect.poll(() => selectedNodeIds(page).then((ids) => ids.length))
    .toBeGreaterThan(1)
})

test('moves and resizes through the DOM editor', async ({
  page,
}) => {
  await page.goto('/figjam')

  const sticky = designNode(page, 'figjam-sticky')

  await sticky.click()
  await expectSelection(page, ['figjam-sticky'])

  const initialLeft = await readComputedNumber(sticky, 'left')
  const initialTop = await readComputedNumber(sticky, 'top')

  await dragSelectedNode(page, sticky, { x: 42, y: 24 })

  const movedLeft = await readComputedNumber(sticky, 'left')
  const movedTop = await readComputedNumber(sticky, 'top')

  expect(Math.abs(movedLeft - initialLeft) + Math.abs(movedTop - initialTop))
    .toBeGreaterThan(1)
  await undo(page)
  await expect.poll(() => readComputedNumber(sticky, 'left')).toBe(initialLeft)
  await expect.poll(() => readComputedNumber(sticky, 'top')).toBe(initialTop)
  await redo(page)
  await expect.poll(() => readComputedNumber(sticky, 'left')).toBe(movedLeft)
  await expect.poll(() => readComputedNumber(sticky, 'top')).toBe(movedTop)

  const initialWidth = await readComputedNumber(sticky, 'width')
  const initialHeight = await readComputedNumber(sticky, 'height')

  await resizeSelectedNode(page, { x: 34, y: 22 })

  const resizedWidth = await readComputedNumber(sticky, 'width')
  const resizedHeight = await readComputedNumber(sticky, 'height')

  expect(resizedWidth).toBeGreaterThan(initialWidth)
  expect(resizedHeight).toBeGreaterThan(initialHeight)
  await undo(page)
  await expect.poll(() => readComputedNumber(sticky, 'width')).toBe(initialWidth)
  await expect.poll(() => readComputedNumber(sticky, 'height')).toBe(initialHeight)
  await redo(page)
  await expect.poll(() => readComputedNumber(sticky, 'width')).toBe(resizedWidth)
  await expect.poll(() => readComputedNumber(sticky, 'height')).toBe(resizedHeight)

})

test('previews, cancels, commits, and restores direct text edits', async ({
  page,
}) => {
  await page.goto('/figjam')

  const app = figJamApp(page)
  const sticky = designNode(page, 'figjam-sticky')
  const initialText = 'Post-it'

  await sticky.dblclick({ force: true })
  const editor = page.getByRole('textbox', {
    name: 'Edit sticky note text',
  })

  await expect(editor).toBeVisible()
  await editor.fill('Cancelled DOM draft')
  await expect(app).toHaveAttribute('data-preview-node-id', 'figjam-sticky')
  await expect(sticky).toContainText('Cancelled DOM draft')
  await page.keyboard.press('Escape')
  await expect(editor).toHaveCount(0)
  await expect(sticky).toContainText(initialText)
  await expect.poll(() => app.getAttribute('data-preview-node-id')).toBeNull()

  await sticky.dblclick({ force: true })
  await editor.fill('Ship the canonical DOM board')
  await page.keyboard.press(`${primaryModifier()}+Enter`)
  await expect(editor).toHaveCount(0)
  await expect(sticky).toContainText('Ship the canonical DOM board')
  await undo(page)
  await expect(sticky).toContainText(initialText)
  await redo(page)
  await expect(sticky).toContainText('Ship the canonical DOM board')
})

test('keeps a blurred composition preview until its final input commits', async ({
  page,
}) => {
  await page.goto('/figjam')

  const app = figJamApp(page)
  const sticky = designNode(page, 'figjam-sticky')

  await sticky.dblclick({ force: true })
  const editor = page.getByRole('textbox', {
    name: 'Edit sticky note text',
  })

  await editor.focus()
  await editor.dispatchEvent('compositionstart', { data: '한' })
  await editor.evaluate((element) => element.blur())

  await expect(editor).toBeVisible()
  await expect(app).toHaveAttribute('data-preview-node-id', 'figjam-sticky')

  await editor.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent('compositionend', {
      bubbles: true,
      data: '한',
    }))
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set

    setter?.call(element, '한글 입력')
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })

  await expect(editor).toHaveCount(0)
  await expect(sticky).toContainText('한글 입력')
  await expect.poll(() => app.getAttribute('data-preview-node-id')).toBeNull()
})

test('honors widget move and resize capabilities in DOM controls', async ({
  page,
}) => {
  await page.goto('/figjam')

  const stageBox = await requiredBox(figJamStage(page))
  const comments = page.locator('[data-figjam-widget="comment"]')

  await page.getByRole('button', { name: 'Comment tool' }).click()
  await page.mouse.click(
    stageBox.x + stageBox.width * 0.8,
    stageBox.y + stageBox.height * 0.76,
  )
  const comment = comments.last()
  const editor = page.getByRole('textbox', { name: 'Edit comment text' })

  await expect(comment).toHaveAttribute('data-selected', 'true')
  await editor.fill('Movable annotation')
  await page.keyboard.press(`${primaryModifier()}+Enter`)
  await page.keyboard.down(primaryModifier())
  await expect(page.locator('.figma-dom-moveable')).toHaveCount(1)
  await expect(page.locator(
    '.figma-dom-moveable .moveable-control[data-direction="se"]',
  )).toHaveCount(0)
  await page.keyboard.up(primaryModifier())

  const initialLeft = await readComputedNumber(comment, 'left')

  await dragSelectedNode(page, comment, { x: 28, y: 16 })
  await expect.poll(() => readComputedNumber(comment, 'left'))
    .not.toBe(initialLeft)
})

test('creates DOM drawings and a connector with stable node attachments', async ({
  page,
}) => {
  await page.goto('/figjam')

  const stageBox = await requiredBox(figJamStage(page))
  const drawings = page.locator('[data-figjam-widget="drawing"]')
  const drawingTools = [
    { button: 'Pen tool', variant: 'path', y: 0.7 },
    { button: 'Marker tool', variant: 'marker', y: 0.78 },
    { button: 'Highlighter tool', variant: 'highlight', y: 0.86 },
  ] as const

  for (const drawingTool of drawingTools) {
    const initialCount = await drawings.count()
    const x = stageBox.x + stageBox.width * 0.66
    const y = stageBox.y + stageBox.height * drawingTool.y

    await page.getByRole('button', { name: drawingTool.button }).click()
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 48, y - 22, { steps: 3 })
    await page.mouse.move(x + 104, y + 8, { steps: 3 })
    await page.mouse.move(x + 152, y - 18, { steps: 3 })
    await page.mouse.up()

    await expect(drawings).toHaveCount(initialCount + 1)
    await expect(drawings.last())
      .toHaveAttribute('data-drawing-variant', drawingTool.variant)
    await expect(drawings.last()).toHaveAttribute('data-selected', 'true')
  }

  const connectors = page.locator('[data-figjam-widget="connector"]')
  const initialConnectorCount = await connectors.count()
  const startBox = await requiredBox(designNode(page, 'figjam-sticky'))
  const endBox = await requiredBox(designNode(page, 'figjam-sticky-next'))

  await page.getByRole('button', { name: 'Arrow tool' }).click()
  await page.mouse.move(
    startBox.x + startBox.width - 12,
    startBox.y + 28,
  )
  await page.mouse.down()
  await page.mouse.move(
    endBox.x + 12,
    endBox.y + 28,
    { steps: 8 },
  )
  await page.mouse.up()

  await expect(connectors).toHaveCount(initialConnectorCount + 1)
  await expect(connectors.last())
    .toHaveAttribute('data-connector-start-id', 'figjam-sticky')
  await expect(connectors.last())
    .toHaveAttribute('data-connector-end-id', 'figjam-sticky-next')
  await expect(connectors.last()).toHaveAttribute('data-selected', 'true')
})

test('erases stroke drawings without deleting ordinary design nodes', async ({
  page,
}) => {
  await page.goto('/figjam')

  const marker = designNode(page, 'figjam-drawing')
  const shape = designNode(page, 'figjam-shape')

  await page.getByRole('button', { name: 'Eraser tool' }).click()
  await shape.click({ force: true })
  await expect(shape).toBeVisible()

  const markerBox = await requiredBox(marker)

  await marker.dispatchEvent('pointerdown', {
    button: 0,
    buttons: 1,
    clientX: markerBox.x + markerBox.width / 2,
    clientY: markerBox.y + markerBox.height / 2,
    pointerId: 17,
  })
  await expect(marker).toHaveCount(0)
  await undo(page)
  await expect(marker).toBeVisible()
})

test('quick-creates a connected sticky as one atomic history entry', async ({
  page,
}) => {
  await page.goto('/figjam')

  const stickyNotes = page.locator('[data-figjam-widget="sticky-note"]')
  const connectors = page.locator('[data-figjam-widget="connector"]')
  const initialStickyCount = await stickyNotes.count()
  const initialConnectorCount = await connectors.count()

  await designNode(page, 'figjam-sticky').click()
  for (const direction of ['bottom', 'left', 'right', 'top'] as const) {
    await expect(page.getByRole('button', {
      name: `Create sticky note ${direction}`,
    })).toBeVisible()
  }

  await page.getByRole('button', { name: 'Create sticky note right' }).click()
  await expect(stickyNotes).toHaveCount(initialStickyCount + 1)
  await expect(connectors).toHaveCount(initialConnectorCount + 1)
  const createdNodeId = await selectedNodeId(page)

  expect(createdNodeId).not.toBeNull()
  expect(createdNodeId).not.toBe('figjam-sticky')
  await expect(connectors.last())
    .toHaveAttribute('data-connector-start-id', 'figjam-sticky')
  await expect(connectors.last())
    .toHaveAttribute('data-connector-end-id', createdNodeId!)

  await undo(page)
  await expect(stickyNotes).toHaveCount(initialStickyCount)
  await expect(connectors).toHaveCount(initialConnectorCount)
  await expect(designNode(page, createdNodeId!)).toHaveCount(0)
})

test('copies, pastes, nudges, deletes, undoes, and redoes with the keyboard', async ({
  page,
}) => {
  await page.goto('/figjam')

  const stickyNotes = page.locator('[data-figjam-widget="sticky-note"]')
  const source = designNode(page, 'figjam-sticky')
  const initialCount = await stickyNotes.count()

  await source.click()
  await page.keyboard.press(`${primaryModifier()}+C`)
  await page.keyboard.press(`${primaryModifier()}+V`)
  await expect(stickyNotes).toHaveCount(initialCount + 1)

  const copiedNodeId = await selectedNodeId(page)

  expect(copiedNodeId).not.toBeNull()
  expect(copiedNodeId).not.toBe('figjam-sticky')
  const copy = designNode(page, copiedNodeId!)

  await expect(copy).toContainText('Post-it')
  await expect(copy).toHaveAttribute('data-selected', 'true')

  const initialLeft = await readComputedNumber(copy, 'left')
  const initialTop = await readComputedNumber(copy, 'top')

  await page.keyboard.press('ArrowRight')
  await expect.poll(() => readComputedNumber(copy, 'left'))
    .toBe(initialLeft + 1)
  await page.keyboard.press('Shift+ArrowDown')
  await expect.poll(() => readComputedNumber(copy, 'top'))
    .toBe(initialTop + 10)
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect.poll(() => readComputedNumber(copy, 'top')).toBe(initialTop)

  await page.keyboard.press('Delete')
  await expect(stickyNotes).toHaveCount(initialCount)
  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(stickyNotes).toHaveCount(initialCount + 1)
  await expect(copy).toBeVisible()
  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(stickyNotes).toHaveCount(initialCount)
  await expect(copy).toHaveCount(0)
})

test('pans and zooms the canonical DOM viewport', async ({ page }) => {
  await page.goto('/figjam')

  const app = figJamApp(page)
  const stage = figJamStage(page)
  const stageBox = await requiredBox(stage)
  const sticky = designNode(page, 'figjam-sticky')
  const initialNodeBox = await requiredBox(sticky)
  const initialScale = await readNumericAttribute(app, 'data-viewport-scale')

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(() => readNumericAttribute(app, 'data-viewport-scale'))
    .toBeGreaterThan(initialScale)

  await page.getByRole('button', { name: 'Pan tool' }).click()
  await expect(stage).toHaveAttribute('data-mode', 'pan')
  const start = {
    x: stageBox.x + 32,
    y: stageBox.y + stageBox.height * 0.55,
  }

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await expect(stage).toHaveAttribute('data-gesture', 'pan')
  await page.mouse.move(start.x + 72, start.y + 36, { steps: 6 })
  await page.mouse.up()
  await expect.poll(async () => {
    const nextNodeBox = await requiredBox(sticky)

    return Math.abs(nextNodeBox.x - initialNodeBox.x) +
      Math.abs(nextNodeBox.y - initialNodeBox.y)
  }).toBeGreaterThan(20)

  await page.getByRole('button', { name: 'Reset viewport' }).click()
  await expect.poll(() => readNumericAttribute(app, 'data-viewport-scale'))
    .toBeCloseTo(0.82, 5)
})

test('inserts every hidden family through the command palette', async ({
  page,
}) => {
  await page.goto('/figjam')

  const insertions = [
    {
      command: 'Add label',
      locator: page.locator(
        '[data-figjam-widget="text"][data-text-variant="label"]',
      ),
    },
    {
      command: 'Add card',
      locator: page.locator(
        '[data-figjam-widget="text"][data-text-variant="card"]',
      ),
    },
    {
      command: 'Add checklist',
      locator: page.locator('[data-figjam-widget="checklist"]'),
    },
    {
      command: 'Add kanban',
      locator: page.locator('[data-figjam-widget="kanban"]'),
    },
    {
      command: 'Add table',
      locator: page.locator('[data-figjam-widget="table"]'),
    },
    {
      command: 'Add sticker or stamp',
      locator: page.locator('[data-figjam-widget="stamp"]'),
    },
    {
      command: 'Add vote',
      locator: page.locator('[data-stamp-kind="vote"]'),
    },
    {
      command: 'Add image placeholder',
      locator: page.locator(
        '[data-figjam-widget="image"][data-image-placeholder="true"]',
      ),
    },
    {
      command: 'Add link preview',
      locator: page.locator('[data-figjam-widget="link-preview"]'),
    },
  ] as const

  for (const insertion of insertions) {
    const initialCount = await insertion.locator.count()

    await runPaletteCommand(page, insertion.command)
    await expect(insertion.locator).toHaveCount(initialCount + 1)
    await expect(insertion.locator.last()).toHaveAttribute(
      'data-selected',
      'true',
    )
  }
})

test('imports HTML tables and URL previews through the canonical paste path', async ({
  page,
}) => {
  await page.goto('/figjam')

  const tables = page.locator('[data-figjam-widget="table"]')
  const links = page.locator('[data-figjam-widget="link-preview"]')
  const initialTableCount = await tables.count()
  const initialLinkCount = await links.count()

  await dispatchPaste(page, {
    html: '<table><tr><th>Owner</th><th>Status</th></tr><tr><td>Ada</td><td>Done</td></tr></table>',
  })
  await expect(tables).toHaveCount(initialTableCount + 1)
  await expect(tables.last()).toContainText('Owner')
  await expect(tables.last()).toContainText('Ada')
  await expect(tables.last()).toHaveAttribute('data-selected', 'true')

  await dispatchPaste(page, { text: 'https://example.com/roadmap' })
  await expect(links).toHaveCount(initialLinkCount + 1)
  await expect(links.last().getByRole('link')).toHaveAttribute(
    'href',
    'https://example.com/roadmap',
  )
  await expect(links.last()).toHaveAttribute('data-selected', 'true')
})

test('restores authored DOM content and stable references after reload', async ({
  page,
}) => {
  await page.goto('/figjam')

  await runPaletteCommand(page, 'Add sticky note')
  const nodeId = await selectedNodeId(page)

  expect(nodeId).not.toBeNull()
  const sticky = designNode(page, nodeId!)

  await sticky.dblclick({ force: true })
  const editor = page.getByRole('textbox', {
    name: 'Edit sticky note text',
  })

  await editor.fill('Persisted canonical note')
  await page.keyboard.press(`${primaryModifier()}+Enter`)
  await page.keyboard.press('ArrowRight')
  const persistedLeft = await readComputedNumber(sticky, 'left')
  const nodeCount = await readNumericAttribute(
    figJamApp(page),
    'data-document-node-count',
  )

  await expect.poll(async () => {
    const serialized = await page.evaluate(
      (storageKey) => localStorage.getItem(storageKey),
      FIGJAM_STORAGE_KEY,
    )

    return serialized?.includes('Persisted canonical note') ?? false
  }).toBe(true)

  await page.reload()

  const restored = designNode(page, nodeId!)

  await expect(figJamApp(page)).toHaveAttribute(
    'data-document-node-count',
    String(nodeCount),
  )
  await expect(restored).toContainText('Persisted canonical note')
  await expect.poll(() => readComputedNumber(restored, 'left'))
    .toBe(persistedLeft)
  await expect(designNode(page, 'figjam-connector'))
    .toHaveAttribute('data-connector-start-id', 'figjam-sticky')
  await expect(designNode(page, 'figjam-connector'))
    .toHaveAttribute('data-connector-end-id', 'figjam-sticky-next')
  await expect(page.locator('[data-canvas-item-id]')).toHaveCount(0)
})

async function expectSeedFamily(
  page: Page,
  family: string,
  count: number,
) {
  const nodes = page.locator(`[data-figjam-widget="${family}"]`)

  await expect(nodes).toHaveCount(count)
  await expect(nodes.first()).toBeVisible()
}

function figJamApp(page: Page) {
  return page.locator('main.figjam-react-app')
}

function figJamStage(page: Page) {
  return page.getByRole('region', { name: 'FigJam canvas' })
    .locator('.figjam-react-stage')
}

function designNode(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`)
}

async function expectSelection(page: Page, expected: readonly string[]) {
  await expect.poll(() => selectedNodeIds(page)).toEqual(expected)
}

async function dispatchPaste(
  page: Page,
  { html = '', text = '' }: { readonly html?: string; readonly text?: string },
) {
  await page.evaluate(({ html: htmlValue, text: textValue }) => {
    const clipboardData = new DataTransfer()

    if (htmlValue) {
      clipboardData.setData('text/html', htmlValue)
    }

    if (textValue) {
      clipboardData.setData('text/plain', textValue)
    }

    window.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData,
    }))
  }, { html, text })
}

async function selectedNodeIds(page: Page) {
  const value = await figJamApp(page).getAttribute('data-selected-node-ids')

  return value?.split(' ').filter(Boolean) ?? []
}

async function selectedNodeId(page: Page) {
  return figJamApp(page).getAttribute('data-selected-node-id')
}

async function runPaletteCommand(page: Page, command: string) {
  await expect(figJamApp(page)).toHaveAttribute('data-selected-node-id', /.+/)
  await expect(page.getByRole('toolbar', { name: 'FigJam tools' }))
    .toBeVisible()
  await figJamStage(page).focus()
  await expect(figJamStage(page)).toBeFocused()
  await page.keyboard.press(`${primaryModifier()}+K`)
  const dialog = page.getByRole('dialog', { name: 'Command palette' })
  const input = page.getByRole('combobox', { name: 'Search commands' })

  await expect(dialog).toBeVisible()
  await input.fill(command)
  await expect(dialog.getByRole('option')).toHaveCount(1)
  await expect(dialog.getByRole('option')).toContainText(command)
  await page.keyboard.press('Enter')
  await expect(dialog).toHaveCount(0)
}

async function requiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

async function dragSelectedNode(
  page: Page,
  node: Locator,
  delta: { readonly x: number; readonly y: number },
) {
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
}

async function resizeSelectedNode(
  page: Page,
  delta: { readonly x: number; readonly y: number },
) {
  await page.keyboard.down(primaryModifier())
  const handle = page.locator('.figma-dom-moveable')
    .locator('.moveable-control[data-direction="se"]')
  await expect(handle).toBeVisible()
  await handle.hover()
  const box = await requiredBox(handle)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.up(primaryModifier())
}

async function readComputedNumber(
  locator: Locator,
  property: 'height' | 'left' | 'top' | 'width',
) {
  return locator.evaluate((element, name) =>
    Number.parseFloat(getComputedStyle(element)[name]), property)
}

async function readNumericAttribute(locator: Locator, name: string) {
  const value = await locator.getAttribute(name)

  return Number.parseFloat(value ?? 'NaN')
}

async function undo(page: Page) {
  await page.getByRole('button', { name: 'Undo' }).click()
}

async function redo(page: Page) {
  await page.getByRole('button', { name: 'Redo' }).click()
}

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
