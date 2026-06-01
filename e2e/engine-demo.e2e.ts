import { expect, test, type Locator, type Page } from '@playwright/test'

const SCREENSHOT_SMOKE_VIEWPORTS = [
  {
    minScreenshotBytes: 10_000,
    minVisibleItemArea: 28_000,
    name: 'desktop',
    viewport: { height: 720, width: 1280 },
  },
  {
    minScreenshotBytes: 6_000,
    minVisibleItemArea: 8_000,
    name: 'mobile',
    viewport: { height: 844, width: 390 },
  },
] as const

test('opens as a minimal canvas affordance engine demo', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('toolbar', {
    name: 'Engine affordances',
  })).toBeVisible()
  await expect(page.getByText('Design system')).toHaveCount(0)
  await expect(page.locator('.demo-html-specimen-preview')).toHaveCount(0)
  await expect(page.locator('.html-specimen-css-inspector')).toHaveCount(0)
  await expect(page.locator('.emote-controls')).toHaveCount(0)
  await expect(page.locator('.stamp-controls')).toHaveCount(0)
  await expect(page.locator('.voting-session')).toHaveCount(0)
  await expect(page.locator('.grid-plane')).toHaveCount(0)
  await expect(page.locator('.alignment-guide')).toHaveCount(0)
  await expect(page.locator('.spacing-guide')).toHaveCount(0)
  await expect(page.locator('.context-command-menu')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Voting session' }))
    .toHaveCount(0)

  await expect(page.locator('[data-canvas-item-id="engine-shape"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-text"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-drawing"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-sticky"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-arrow"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-highlight"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-image"]'))
    .toBeVisible()
  await expect(page.locator('[data-canvas-item-id="engine-shape"]'))
    .toHaveAttribute('data-selected', 'true')
  await expect(page.locator('[data-canvas-item-id="engine-shape"] .item-outline'))
    .toBeVisible()
  await expect(page.locator('.resize-handle').first()).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toHaveCount(0)

  await page.locator('[data-canvas-item-id="engine-shape"]').click()
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit text' }))
    .toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Object actions' })
    .getByRole('button', { exact: true, name: 'Shape' }))
    .toBeVisible()
  const shapeMenu = await openObjectToolbarMenu(page, 'Shape')
  await expect(shapeMenu.getByRole('button', { name: 'Rect shape' }))
    .toBeVisible()
  await expect(shapeMenu.getByRole('button', { name: 'Ellipse shape' }))
    .toBeVisible()
  await expect(shapeMenu.getByRole('button', { name: 'Diamond shape' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Fill color' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Stroke color' }))
    .toBeVisible()
  await expect(page.getByRole('toolbar', {
    name: 'Object actions',
  }).getByRole('button', { name: /stamp/i }))
    .toHaveCount(0)
  await expect(page.getByRole('group', { name: 'Stamp reactions' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Add +1 stamp' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Add ! stamp' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Add ? stamp' }))
    .toBeVisible()
  const structureMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(structureMenu.getByRole('button', { name: 'Section selection' }))
    .toBeVisible()
  await expect(structureMenu.getByRole('button', { name: 'Group selection' }))
    .toHaveCount(0)
  const layerMenu = await openObjectToolbarMenu(page, 'Layer order')
  await expect(layerMenu.getByRole('button', { name: 'Bring to front' }))
    .toBeVisible()
  await expect(layerMenu.getByRole('button', { name: 'Bring forward' }))
    .toBeVisible()
  await expect(layerMenu.getByRole('button', { name: 'Send backward' }))
    .toBeDisabled()
  await expect(layerMenu.getByRole('button', { name: 'Send to back' }))
    .toBeDisabled()
  await expect(page.getByRole('button', { name: 'Fill #C2E5FF' }))
    .toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Duplicate selection' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete selection' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Shape tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Ellipse tool' }))
    .toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Diamond tool' }))
    .toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Sticky note tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Comment tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Section tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Arrow tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Highlighter tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Eraser tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Voting session' }))
    .toBeVisible()

  const initialScale = await readCanvasScalePercent(page)

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(() => readCanvasScalePercent(page))
    .toBeGreaterThan(initialScale)
})

test('keeps desktop and mobile canvas screenshots nonblank', async ({
  page,
}) => {
  for (const target of SCREENSHOT_SMOKE_VIEWPORTS) {
    await page.setViewportSize(target.viewport)
    await page.goto('/')

    await expect(page.locator('.canvas-stage')).toBeVisible()
    await expect(page.locator('[data-canvas-item-id]')).not.toHaveCount(0)

    const screenshot = await page.screenshot({
      animations: 'disabled',
    })
    const visibleItemArea = await getVisibleCanvasItemArea(page)

    expect(
      screenshot.byteLength,
      `${target.name} screenshot should not be blank`,
    ).toBeGreaterThan(target.minScreenshotBytes)
    expect(
      visibleItemArea,
      `${target.name} canvas items should occupy visible pixels`,
    ).toBeGreaterThan(target.minVisibleItemArea)
  }
})

test('applies object-specific toolbar actions to the selected item', async ({
  page,
}) => {
  await page.goto('/')
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')

  await expect(shape).toBeVisible()
  await shape.click()

  const initialItemCount = await page.locator('[data-canvas-item-id]').count()

  await page.getByRole('button', { name: 'Fill color' }).click()
  await page.getByRole('button', { name: 'Fill #C2E5FF' }).click()
  await expect(page.locator(
    '[data-canvas-item-id="engine-shape"] .shape-item',
  )).toHaveAttribute('fill', '#C2E5FF')
  await expect.poll(() => page.locator('[data-canvas-item-id]').count())
    .toBe(initialItemCount)

  await clickObjectToolbarMenuAction(page, 'Shape', 'Ellipse shape')
  await expect(page.locator(
    '[data-canvas-item-id="engine-shape"] ellipse.shape-item',
  )).toBeVisible()
  await expect(shape.locator('.canvas-shape-text')).toHaveCSS(
    'display',
    'grid',
  )
  await expect(shape.locator('.canvas-shape-text')).toHaveCSS(
    'align-items',
    'center',
  )
  await expect(shape.locator('.canvas-shape-text')).toHaveCSS(
    'justify-items',
    'center',
  )

  const shapeBox = await getRequiredBox(shape)
  const resizeHandle = page.locator('.resize-handle[data-handle="se"]')
  const resizeHandleBox = await getRequiredBox(resizeHandle)

  await page.mouse.move(
    resizeHandleBox.x + resizeHandleBox.width / 2,
    resizeHandleBox.y + resizeHandleBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    resizeHandleBox.x + resizeHandleBox.width / 2 + 80,
    resizeHandleBox.y + resizeHandleBox.height / 2 + 42,
  )
  await page.mouse.up()
  await expect.poll(async () => (await getRequiredBox(shape)).width)
    .toBeGreaterThan(shapeBox.width)
  await expect(shape.locator('.canvas-shape-text')).toHaveCSS(
    'align-items',
    'center',
  )

  await shape.click()
  await clickObjectToolbarMenuAction(page, 'Rotate', 'Rotate clockwise')
  await expect(shape).toHaveAttribute('data-rotation', '15')
  await expect(shape.locator('.canvas-item-rotation'))
    .toHaveAttribute('transform', /rotate\(15 /)
  await expect(shape.locator('.item-outline')).toBeVisible()
  await expect(page.locator('.resize-handle')).toHaveCount(0)

  await clickObjectToolbarMenuAction(page, 'Rotate', 'Reset rotation')
  await expect(shape).not.toHaveAttribute('data-rotation')
  await expect(page.locator('.resize-handle').first()).toBeVisible()

  await page.locator('[data-canvas-item-id="engine-arrow"]').click()
  await expect(page.getByRole('toolbar', { name: 'Object actions' })
    .getByRole('button', { exact: true, name: 'Rotate' }))
    .toBeDisabled()
  const arrowMenu = await openObjectToolbarMenu(page, 'Arrow')
  await expect(arrowMenu.getByRole('button', { name: 'Elbow connector' }))
    .toHaveAttribute('aria-pressed', 'true')

  await clickObjectToolbarMenuAction(page, 'Arrow', 'Straight connector')
  const straightArrowMenu = await openObjectToolbarMenu(page, 'Arrow')
  await expect(straightArrowMenu.getByRole('button', {
    name: 'Straight connector',
  }))
    .toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Stroke color' }).click()
  await page.getByRole('button', { name: 'Stroke #9747FF' }).click()
  await expect(page.locator(
    '[data-canvas-item-id="engine-arrow"] .arrow-item',
  )).toHaveAttribute('stroke', '#9747FF')

  await page.locator('[data-canvas-item-id="engine-text"]').click()
  await page.getByRole('button', { name: 'Edit text' }).click()
  await expect(page.locator('textarea.text-editor')).toBeVisible()
})

test('adds reaction stamps as independent annotation objects', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const stamps = page.locator('[data-type="stamp"]')

  await shape.click()
  await expect(page.getByRole('group', { name: 'Stamp reactions' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Add +1 stamp' }))
    .toBeVisible()

  const shapeBox = await getRequiredBox(shape)
  const stampCount = await stamps.count()

  await page.getByRole('button', { name: 'Add +1 stamp' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 1)

  const stamp = stamps.last()

  await expect(stamp).toHaveAttribute('data-selected', 'true')
  await expect(stamp).toContainText('+1')

  const stampBox = await getRequiredBox(stamp)

  expect(stampBox.x).toBeGreaterThan(shapeBox.x + shapeBox.width - 48)
  expect(stampBox.y).toBeLessThan(shapeBox.y + 24)

  await stamp.click()
  await expect(page.getByRole('button', { name: 'Duplicate selection' }))
    .toBeVisible()
  await expect(page.getByRole('group', { name: 'Stamp reactions' }))
    .toHaveCount(0)

  await page.getByRole('button', { name: 'Duplicate selection' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 2)

  await page.getByRole('button', { name: 'Delete selection' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 1)
})

test('mirrors multi-selected objects with flip', async ({ page }) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const image = page.locator('[data-canvas-item-id="engine-image"]')

  await expect(shape).toBeVisible()
  await expect(image).toBeVisible()

  await shape.click()
  await image.click({ modifiers: ['Shift'] })

  const beforeShape = await getRequiredBox(shape)
  const beforeImage = await getRequiredBox(image)

  await clickObjectToolbarMenuAction(page, 'Arrange', 'Flip horizontal')

  // mirroring two horizontally-separated objects swaps their screen positions.
  await expect
    .poll(async () => (await getRequiredBox(shape)).x)
    .not.toBe(beforeShape.x)
  await expect
    .poll(async () => (await getRequiredBox(image)).x)
    .not.toBe(beforeImage.x)
})

test('toggles the token-driven dark theme', async ({ page }) => {
  await page.goto('/')

  const root = page.locator('main.engine-demo-app')
  await expect(root).toHaveAttribute('data-theme', 'light')

  const lightBg = await root.evaluate(
    (node) => getComputedStyle(node).backgroundColor,
  )

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(root).toHaveAttribute('data-theme', 'dark')

  const darkBg = await root.evaluate(
    (node) => getComputedStyle(node).backgroundColor,
  )

  // the dark token block must actually repaint the surface, not just flip a flag.
  expect(darkBg).not.toBe(lightBg)

  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(root).toHaveAttribute('data-theme', 'light')
})

test('renders a widget in an isolated shadow root without leaking styles', async ({
  page,
}) => {
  await page.goto('/')

  const widget = page.locator('[data-canvas-item-id="engine-metric-widget"]')
  await expect(widget).toBeVisible()
  // Playwright pierces open shadow roots, so widget content is still reachable.
  await expect(widget.getByText('1,284')).toBeVisible()

  // the widget content lives inside a shadow root (style/DOM encapsulation).
  const hasShadowRoot = await page.evaluate(() => {
    const host = document
      .querySelector('[data-canvas-item-id="engine-metric-widget"]')
      ?.querySelector('.canvas-widget-shadow-host')
    return Boolean(host && host.shadowRoot)
  })
  expect(hasShadowRoot).toBe(true)

  // the widget's <style> probe must not escape onto the document canvas stage.
  const leaked = await page.evaluate(() => {
    const stage = document.querySelector('.canvas-stage')
    return stage
      ? getComputedStyle(stage).getPropertyValue('--metric-widget-leak').trim()
      : 'no-stage'
  })
  expect(leaked).toBe('')
})

test('toggles Todo items in play mode and persists the change', async ({
  page,
}) => {
  await page.goto('/')

  const playTodo = page.locator('[data-canvas-item-id="engine-todo-widget"]')
  await expect(playTodo).toBeVisible()
  await playTodo.click()

  await page.getByRole('button', { name: 'Play widget' }).click()
  const overlay = page.locator('.engine-widget-play-overlay')
  await expect(overlay).toBeVisible()

  const checkbox = overlay.getByRole('checkbox', {
    name: 'Ship the isolation host',
  })
  await expect(checkbox).not.toBeChecked()
  await checkbox.click()
  // the checkbox reflects committed document data after the round-trip.
  await expect(checkbox).toBeChecked()

  await page.getByRole('button', { name: 'Stop widget' }).click()
  await expect(overlay).toHaveCount(0)

  // re-entering play re-reads the document: the toggle persisted.
  await page.getByRole('button', { name: 'Play widget' }).click()
  await expect(
    overlay.getByRole('checkbox', { name: 'Ship the isolation host' }),
  ).toBeChecked()
})

test('leaves widget play mode when the selection changes', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-canvas-item-id="engine-todo-widget"]').click()
  await page.getByRole('button', { name: 'Play widget' }).click()
  await expect(page.locator('.engine-widget-play-overlay')).toBeVisible()

  // selecting another object exits play mode.
  await page.locator('[data-canvas-item-id="engine-shape"]').click()
  await expect(page.locator('.engine-widget-play-overlay')).toHaveCount(0)

  // re-selecting the widget starts in stop mode, not resumed play.
  await page.locator('[data-canvas-item-id="engine-todo-widget"]').click()
  await expect(page.getByRole('button', { name: 'Play widget' })).toBeVisible()
  await expect(page.locator('.engine-widget-play-overlay')).toHaveCount(0)
})

test('renders the Todo widget with its checklist items', async ({ page }) => {
  await page.goto('/')

  const todo = page.locator('[data-canvas-item-id="engine-todo-widget"]')
  await expect(todo).toBeVisible()
  // shadow-root content is reachable through Playwright's shadow piercing.
  await expect(todo.getByText('Today')).toBeVisible()
  await expect(todo.getByText('Ship the isolation host')).toBeVisible()
  await expect(todo.getByText('Add a Todo widget')).toBeVisible()
})

test('toggles an arrow between arrowhead and plain line', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-canvas-item-id="engine-arrow"]').click()
  const arrowPath = page.locator(
    '[data-canvas-item-id="engine-arrow"] .arrow-item',
  )

  // arrows ship with an arrowhead marker by default.
  await expect(arrowPath).toHaveAttribute('marker-end', /.+/)

  await clickObjectToolbarMenuAction(page, 'Arrow', 'Line (no arrow head)')
  await expect(arrowPath).not.toHaveAttribute('marker-end', /.+/)

  await clickObjectToolbarMenuAction(page, 'Arrow', 'Arrow head')
  await expect(arrowPath).toHaveAttribute('marker-end', /.+/)
})

test('exports the selected objects as a downloadable image', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  await expect(shape).toBeVisible()
  await shape.click()

  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 })
  await clickObjectToolbarMenuAction(page, 'More actions', 'Export selection as image')
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.png$/)
})

test('selects every same-type object with select same', async ({ page }) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')

  await expect(shape).toBeVisible()
  await shape.click()

  // only the clicked shape is selected to start with.
  await expect(page.locator('[data-canvas-item-id][data-selected="true"]'))
    .toHaveCount(1)

  await clickObjectToolbarMenuAction(page, 'More actions', 'Select same type')

  // the seed has three shape objects (rect, ellipse, diamond).
  await expect(page.locator('[data-canvas-item-id][data-selected="true"]'))
    .toHaveCount(3)
})

test('creates and edits comments as independent annotation objects', async ({
  page,
}) => {
  await page.goto('/')

  const comments = page.locator('[data-type="comment"]')
  const initialCommentCount = await comments.count()
  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  await page.getByRole('button', { name: 'Comment tool' }).click()
  await page.mouse.click(stageBox.x + 820, stageBox.y + 250)

  await expect.poll(() => comments.count()).toBe(initialCommentCount + 1)

  const comment = comments.last()

  await expect(comment).toHaveAttribute('data-selected', 'true')
  await expect(comment.locator('.comment-item')).toBeVisible()
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.locator('textarea.text-editor').fill('Needs follow-up')
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)
  await expect(comment.locator('.comment-body-card'))
    .toContainText('Needs follow-up')

  await page.keyboard.press('Control+D')
  await expect.poll(() => comments.count()).toBe(initialCommentCount + 2)

  await page.keyboard.press('Delete')
  await expect.poll(() => comments.count()).toBe(initialCommentCount + 1)
})

test('runs a simple voting session on top of stamps', async ({ page }) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const stamps = page.locator('[data-type="stamp"]')

  await page.getByRole('button', { name: 'Voting session' }).click()

  const voting = page.getByRole('region', { name: 'Voting session' })

  await expect(voting).toBeVisible()
  await voting.getByLabel('Voting prompt').fill('Pick one')
  await voting.getByRole('button', { name: 'Decrease votes' }).click()
  await voting.getByRole('button', { name: 'Decrease votes' }).click()
  await expect(voting.getByLabel('Votes per person')).toHaveText('1')

  await voting.getByRole('button', { name: 'Start voting' }).click()
  await expect(voting).toHaveAttribute('data-status', 'active')
  await expect(voting.getByLabel('Voting result count')).toHaveText('0/1')

  const stampCount = await stamps.count()

  await shape.click()
  await page.getByRole('button', { name: 'Add +1 stamp' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 1)
  await expect(voting.getByLabel('Voting result count')).toHaveText('1/1')
  await expect(voting.getByLabel('Voting complete')).toBeVisible()

  await shape.click()
  await expect(page.getByRole('group', { name: 'Stamp reactions' }))
    .toHaveCount(0)

  await voting.getByRole('button', { name: 'End voting' }).click()
  await expect(voting).toHaveAttribute('data-status', 'ended')
  await expect(voting.getByLabel('Voting result count')).toHaveText('1/1')

  await voting.getByRole('button', { name: 'Clear voting results' }).click()
  await expect(voting).toHaveCount(0)

  await page.getByRole('button', { name: 'Voting session' }).click()
  await expect(voting.getByLabel('Voting result count')).toHaveText('0/3')
})

test('keeps object toolbar quiet while dragging selection', async ({ page }) => {
  await page.goto('/')

  const item = page.locator('[data-canvas-item-id="engine-shape"]')
  await item.click()
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toBeVisible()

  const box = await item.boundingBox()

  if (!box) {
    throw new Error('expected selected item bounds')
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 72, box.y + box.height / 2)
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toHaveCount(0)
  await page.mouse.up()
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toHaveCount(0)
})

test('shows snap guides only while moving near aligned objects', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')

  await expect(shape).toBeVisible()
  await expect(page.locator('.alignment-guide')).toHaveCount(0)
  await expect(page.locator('.spacing-guide')).toHaveCount(0)

  await shape.click()

  const initialBox = await getRequiredBox(shape)

  await page.mouse.move(
    initialBox.x + initialBox.width / 2,
    initialBox.y + initialBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    initialBox.x + initialBox.width / 2 + 30,
    initialBox.y + initialBox.height / 2 + 4,
    { steps: 6 },
  )

  await expect.poll(() => page.locator('.alignment-guide').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.alignment-guides')).toHaveCount(1)
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toHaveCount(0)

  await page.mouse.up()

  await expect(page.locator('.alignment-guide')).toHaveCount(0)
  await expect(page.locator('.spacing-guide')).toHaveCount(0)

  const snappedBox = await getRequiredBox(shape)

  expect(Math.round(snappedBox.y)).toBe(Math.round(initialBox.y))
  expect(Math.round(snappedBox.x)).toBeGreaterThan(Math.round(initialBox.x))
})

test('keeps shell controls usable on a mobile viewport', async ({ page }) => {
  const viewport = { height: 844, width: 390 }

  await page.setViewportSize(viewport)
  await page.goto('/')

  const toolRail = page.getByRole('toolbar', { name: 'Engine affordances' })
  const viewportControls = page.getByRole('toolbar', {
    name: 'Viewport controls',
  })

  await expect(toolRail).toBeVisible()
  await expect(viewportControls).toBeVisible()
  await expect(page.getByRole('button', { name: 'Shape tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Zoom in' }))
    .toBeVisible()

  const toolRailBox = await getRequiredBox(toolRail)
  const viewportControlsBox = await getRequiredBox(viewportControls)

  expect(isWithinViewport(toolRailBox, viewport)).toBe(true)
  expect(isWithinViewport(viewportControlsBox, viewport)).toBe(true)
  expect(boxesOverlap(toolRailBox, viewportControlsBox)).toBe(false)

  await page.locator('[data-canvas-item-id="engine-shape"]').click()
  const objectActions = page.getByRole('toolbar', { name: 'Object actions' })

  await expect(objectActions).toBeVisible()
  expect(isWithinViewport(await getRequiredBox(objectActions), viewport))
    .toBe(true)
})

test('routes selection keyboard commands through the engine demo', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')
  const items = page.locator('[data-canvas-item-id]')

  await shape.click()
  await expect(shape).toHaveAttribute('data-selected', 'true')

  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)

  const beforeNudge = await getRequiredBox(shape)

  await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await getRequiredBox(shape)).x)
    .toBeGreaterThan(beforeNudge.x)

  const beforeDuplicateCount = await items.count()

  await page.keyboard.press('Control+D')
  await expect.poll(() => items.count()).toBe(beforeDuplicateCount + 1)

  await page.keyboard.press('Delete')
  await expect.poll(() => items.count()).toBe(beforeDuplicateCount)

  await shape.click()
  await page.keyboard.down('Shift')
  await sticky.click()
  await page.keyboard.up('Shift')
  await expect(shape).toHaveAttribute('data-selected', 'true')
  await expect(sticky).toHaveAttribute('data-selected', 'true')

  const beforePasteCount = await items.count()

  await page.keyboard.press('Control+C')
  await page.keyboard.press('Control+V')
  await expect.poll(() => items.count()).toBe(beforePasteCount + 2)

  await page.keyboard.press('Control+X')
  await expect.poll(() => items.count()).toBe(beforePasteCount)

  await page.keyboard.press('Control+V')
  await expect.poll(() => items.count()).toBe(beforePasteCount + 2)
})

test('runs selection and history commands from the context menu', async ({
  page,
}) => {
  await page.goto('/')

  const workspace = page.locator('.engine-demo-workspace')
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const items = page.locator('[data-canvas-item-id]')

  await shape.click()
  await workspace.focus()
  const beforeDuplicateCount = await items.count()

  await page.keyboard.press('Shift+F10')
  const menu = page.getByRole('toolbar', { name: 'Canvas context commands' })

  await expect(menu).toBeVisible()
  await page.keyboard.press('Tab')
  const duplicateCommand = menu.getByRole('button', { name: 'Duplicate' })

  await expect(duplicateCommand).toBeFocused()
  await duplicateCommand.click()
  await expect(menu).toHaveCount(0)
  await expect.poll(() => items.count()).toBe(beforeDuplicateCount + 1)

  await page.locator('[data-canvas-item-id][data-selected="true"]')
    .first()
    .click({ button: 'right' })
  await expect(menu).toBeVisible()
  await menu.getByRole('button', { name: 'Undo' }).click()
  await expect(menu).toHaveCount(0)
  await expect.poll(() => items.count()).toBe(beforeDuplicateCount)

  await shape.click({ button: 'right' })
  await expect(menu).toBeVisible()
  await workspace.click({ position: { x: 12, y: 12 } })
  await expect(menu).toHaveCount(0)

  await shape.click({ button: 'right' })
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
})

test('reorders selected objects through layer controls and shortcuts', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')

  await shape.click()
  await expect(shape).toHaveAttribute('data-selected', 'true')
  await expectCanvasItemBefore(page, 'engine-shape', 'engine-sticky')

  await clickObjectToolbarMenuAction(page, 'Layer order', 'Bring to front')
  await expectCanvasItemBefore(page, 'engine-sticky', 'engine-shape')
  const layerMenu = await openObjectToolbarMenu(page, 'Layer order')
  await expect(layerMenu.getByRole('button', { name: 'Bring to front' }))
    .toBeDisabled()
  await expect(layerMenu.getByRole('button', { name: 'Send backward' }))
    .toBeEnabled()

  await clickObjectToolbarMenuAction(page, 'Layer order', 'Send to back')
  await expectCanvasItemBefore(page, 'engine-shape', 'engine-sticky')

  await page.keyboard.press('Control+]')
  await expectCanvasItemBefore(page, 'engine-sticky', 'engine-shape')

  await page.keyboard.press('Control+Shift+[')
  await expectCanvasItemBefore(page, 'engine-shape', 'engine-sticky')

  await expect(sticky).toBeVisible()
})

test('exposes group and section structure actions as canvas parts', async ({
  page,
}) => {
  await page.goto('/')

  await selectShapeAndSticky(page)
  const groupMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(groupMenu.getByRole('button', { name: 'Group selection' }))
    .toBeVisible()

  await clickObjectToolbarMenuAction(page, 'Structure', 'Group selection')
  const groups = page.locator('[data-type="group"]')

  await expect(groups).toHaveCount(1)
  await expect(groups.first())
    .toHaveAttribute('data-selected', 'true')

  await groups.first().click()
  await expect(page.getByRole('button', { name: 'Duplicate selection' }))
    .toBeVisible()
  await page.getByRole('button', { name: 'Duplicate selection' }).click()
  await expect.poll(() => groups.count()).toBe(2)
  await expect(page.locator('[data-type="group"][data-selected="true"]'))
    .toHaveCount(1)

  await page.getByRole('button', { name: 'Delete selection' }).click()
  await expect.poll(() => groups.count()).toBe(1)

  await groups.first().click()
  const ungroupMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(ungroupMenu.getByRole('button', { name: 'Ungroup selection' }))
    .toBeVisible()
  await clickObjectToolbarMenuAction(page, 'Structure', 'Ungroup selection')
  await expect.poll(() => groups.count()).toBe(0)
  await expect(page.locator('[data-canvas-item-id="engine-shape"]'))
    .toHaveAttribute('data-selected', 'true')
  await expect(page.locator('[data-canvas-item-id="engine-sticky"]'))
    .toHaveAttribute('data-selected', 'true')

  await selectShapeAndSticky(page)
  const sectionCount = await page.locator(
    '[data-type="component"][data-component="section"]',
  ).count()

  const sectionMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(sectionMenu.getByRole('button', { name: 'Section selection' }))
    .toBeVisible()
  await clickObjectToolbarMenuAction(page, 'Structure', 'Section selection')
  await expect.poll(() =>
    page.locator('[data-type="component"][data-component="section"]').count(),
  ).toBe(sectionCount + 1)
  await expect(page.locator(
    '[data-type="component"][data-component="section"][data-selected="true"]',
  )).toBeVisible()

  const selectedSection = page.locator(
    '[data-type="component"][data-component="section"][data-selected="true"]',
  )
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')

  await selectedSection.click({ position: { x: 96, y: 128 } })
  await page.getByRole('button', { name: 'Edit text' }).click()
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.locator('textarea.text-editor').fill('Planning')
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)
  await expect(selectedSection.locator('.component-section-title'))
    .toContainText('Planning')

  const hideSectionMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(hideSectionMenu.getByRole('button', {
    name: 'Hide section contents',
  }))
    .toBeVisible()
  await clickObjectToolbarMenuAction(page, 'Structure', 'Hide section contents')
  await expect(shape).toHaveCount(0)
  await expect(sticky).toHaveCount(0)
  await expect(selectedSection).toBeVisible()

  await clickObjectToolbarMenuAction(page, 'Structure', 'Show section contents')
  await expect(shape).toBeVisible()
  await expect(sticky).toBeVisible()

  await clickObjectToolbarMenuAction(page, 'Structure', 'Lock section')
  await expect(selectedSection).toHaveAttribute('data-locked', 'true')
  await expect(shape).toHaveAttribute('data-locked', 'true')
  await expect(sticky).toHaveAttribute('data-locked', 'true')

  await page.getByRole('button', { name: 'Unlock all' }).click()
  await expect(selectedSection).not.toHaveAttribute('data-locked', 'true')
  await expect(shape).not.toHaveAttribute('data-locked', 'true')
  await expect(sticky).not.toHaveAttribute('data-locked', 'true')

  await selectedSection.click({ position: { x: 16, y: 80 } })
  const deleteSectionMenu = await openObjectToolbarMenu(page, 'Structure')
  await expect(deleteSectionMenu.getByRole('button', {
    name: 'Delete section frame',
  }))
    .toBeVisible()
  await clickObjectToolbarMenuAction(page, 'Structure', 'Delete section frame')
  await expect.poll(() =>
    page.locator('[data-type="component"][data-component="section"]').count(),
  ).toBe(sectionCount)
  await expect(shape).toBeVisible()
  await expect(sticky).toBeVisible()
})

test('direct-selects and edits a child inside a group', async ({ page }) => {
  await page.goto('/')

  await selectShapeAndSticky(page)
  await clickObjectToolbarMenuAction(page, 'Structure', 'Group selection')

  const group = page.locator('[data-type="group"]').first()
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')

  await expect(group).toHaveAttribute('data-selected', 'true')

  await page.keyboard.down('Shift')
  await shape.click()
  await page.keyboard.up('Shift')

  await expect(shape).toHaveAttribute('data-selected', 'true')
  await expect(group).not.toHaveAttribute('data-selected', 'true')
  await expect(shape.locator('.item-outline')).toBeVisible()
  await expect(group.locator('.group-outline')).toHaveCount(0)

  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.locator('textarea.text-editor').fill('Nested shape')
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)
  await expect(shape).toContainText('Nested shape')

  const beforeMove = await getRequiredBox(shape)
  await page.mouse.move(
    beforeMove.x + beforeMove.width / 2,
    beforeMove.y + beforeMove.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    beforeMove.x + beforeMove.width / 2 + 36,
    beforeMove.y + beforeMove.height / 2 + 20,
  )
  await page.mouse.up()

  await expect.poll(async () => {
    const box = await getRequiredBox(shape)

    return {
      movedRight: box.x > beforeMove.x + 20,
      movedDown: box.y > beforeMove.y + 8,
    }
  }).toEqual({ movedDown: true, movedRight: true })

  const childCountBeforeDuplicate =
    await group.locator('[data-canvas-item-id]').count()

  await page.keyboard.press('Control+D')
  await expect.poll(() =>
    group.locator('[data-canvas-item-id]').count(),
  ).toBe(childCountBeforeDuplicate + 1)
  await expect(page.locator('[data-selected="true"][data-type="shape"]'))
    .toHaveCount(1)

  await page.keyboard.press('Delete')
  await expect.poll(() =>
    group.locator('[data-canvas-item-id]').count(),
  ).toBe(childCountBeforeDuplicate)

  await page.keyboard.down('Shift')
  await shape.click()
  await page.keyboard.up('Shift')
  await expect(shape).toHaveAttribute('data-selected', 'true')

  await page.keyboard.press('Escape')
  await expect(shape).not.toHaveAttribute('data-selected', 'true')

  await shape.click({ position: { x: 12, y: 12 } })
  await expect(group).toHaveAttribute('data-selected', 'true')
  await expect(shape).not.toHaveAttribute('data-selected', 'true')
})

test('arranges and tidies selected layout objects', async ({ page }) => {
  await page.goto('/')

  await selectShapeStickyTextAndArrow(page)

  const arrangeMenu = await openObjectToolbarMenu(page, 'Arrange')
  await expect(arrangeMenu.getByRole('button', { name: 'Align left' }))
    .toBeVisible()
  await expect(arrangeMenu.getByRole('button', {
    name: 'Distribute horizontally',
  }))
    .toBeVisible()
  await expect(arrangeMenu.getByRole('button', { name: 'Tidy selection' }))
    .toBeVisible()

  const arrow = page.locator('[data-canvas-item-id="engine-arrow"]')
  const text = page.locator('[data-canvas-item-id="engine-text"]')
  const arrowBefore = await getRequiredBox(arrow)
  const textBefore = await getRequiredBox(text)

  await clickObjectToolbarMenuAction(page, 'Arrange', 'Tidy selection')
  await expect.poll(async () => Math.round((await getRequiredBox(text)).y))
    .not.toBe(Math.round(textBefore.y))

  const arrowAfterTidy = await getRequiredBox(arrow)

  expect(Math.round(arrowAfterTidy.x)).toBe(Math.round(arrowBefore.x))
  expect(Math.round(arrowAfterTidy.y)).toBe(Math.round(arrowBefore.y))

  await clickObjectToolbarMenuAction(page, 'Arrange', 'Align left')
  const left = Math.round((await getRequiredBox(
    page.locator('[data-canvas-item-id="engine-shape"]'),
  )).x)

  await expect.poll(async () => Math.round((await getRequiredBox(text)).x))
    .toBe(left)
})

test('shows expected selection feedback while marquee selecting', async ({
  page,
}) => {
  await page.goto('/')

  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  await page.mouse.move(stageBox.x + 28, stageBox.y + 28)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 118, stageBox.y + 88)
  await expect(page.locator('.marquee')).toBeVisible()
  await page.mouse.up()
})

test('keeps text editing and drawing as engine affordances', async ({
  page,
}) => {
  await page.goto('/')

  await page.locator('[data-canvas-item-id="engine-text"]').dblclick()
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.locator('textarea.text-editor').fill('Edited text')
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)
  await expect(page.locator('[data-canvas-item-id="engine-text"]'))
    .toContainText('Edited text')

  await page.getByRole('button', { name: 'Marker tool' }).click()
  await expect(page.getByRole('button', { name: 'Marker tool' }))
    .toHaveAttribute('aria-pressed', 'true')

  const markerCount = await page.locator('[data-type="marker"]').count()
  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  await page.mouse.move(stageBox.x + 520, stageBox.y + 420)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 570, stageBox.y + 450)
  await page.mouse.move(stageBox.x + 630, stageBox.y + 420)
  await page.mouse.up()

  await expect.poll(() => page.locator('[data-type="marker"]').count())
    .toBeGreaterThan(markerCount)
})

test('creates shape, sticky, section, arrow, and highlighter objects from exposed tools', async ({
  page,
}) => {
  await page.goto('/')

  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  const shapeCount = await page.locator('[data-type="shape"]').count()

  await page.getByRole('button', { name: 'Shape tool' }).click()
  await page.mouse.move(stageBox.x + 720, stageBox.y + 96)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 812, stageBox.y + 158)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="shape"]').count())
    .toBeGreaterThan(shapeCount)

  const stickyCount = await page.locator(
    '[data-type="component"][data-component="sticky"]',
  ).count()

  await page.getByRole('button', { name: 'Sticky note tool' }).click()
  await page.mouse.click(stageBox.x + 720, stageBox.y + 210)
  await expect.poll(() =>
    page.locator('[data-type="component"][data-component="sticky"]').count(),
  ).toBeGreaterThan(stickyCount)
  await expect(page.locator('textarea.text-editor')).toBeVisible()
  await page.locator('textarea.text-editor').fill('New note')
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)

  const sectionCount = await page.locator(
    '[data-type="component"][data-component="section"]',
  ).count()

  await page.getByRole('button', { name: 'Section tool' }).click()
  await page.mouse.move(stageBox.x + 880, stageBox.y + 112)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 1060, stageBox.y + 260)
  await page.mouse.up()
  await expect.poll(() =>
    page.locator('[data-type="component"][data-component="section"]').count(),
  ).toBeGreaterThan(sectionCount)

  const arrowCount = await page.locator('[data-type="arrow"]').count()

  await page.getByRole('button', { name: 'Arrow tool' }).click()
  await page.mouse.move(stageBox.x + 708, stageBox.y + 220)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 812, stageBox.y + 270)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="arrow"]').count())
    .toBeGreaterThan(arrowCount)

  const highlightCount = await page.locator('[data-type="highlight"]').count()

  await page.getByRole('button', { name: 'Highlighter tool' }).click()
  await page.mouse.move(stageBox.x + 688, stageBox.y + 388)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 760, stageBox.y + 420)
  await page.mouse.move(stageBox.x + 828, stageBox.y + 394)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="highlight"]').count())
    .toBeGreaterThan(highlightCount)
})

test('quick-creates connected sticky notes with inherited style', async ({
  page,
}) => {
  await page.goto('/')

  const source = page.locator('[data-canvas-item-id="engine-sticky"]')
  await source.click()
  await expect(source).toHaveAttribute('data-selected', 'true')

  await page.getByRole('button', { name: 'Fill color' }).click()
  await page.getByRole('button', { name: 'Fill #C2E5FF' }).click()
  await expect(source.locator('.component-sticky-note'))
    .toHaveAttribute('fill', '#C2E5FF')

  const stickyItems = page.locator(
    '[data-type="component"][data-component="sticky"]',
  )
  const arrowItems = page.locator('[data-type="arrow"]')
  const stickyCount = await stickyItems.count()
  const arrowCount = await arrowItems.count()

  await page.getByRole('button', { name: 'Create sticky note right' }).click()
  await expect.poll(() => stickyItems.count()).toBe(stickyCount + 1)
  await expect.poll(() => arrowItems.count()).toBe(arrowCount + 1)
  await expect(page.locator('textarea.text-editor')).toBeVisible()

  const selectedSticky = page.locator(
    '[data-type="component"][data-component="sticky"][data-selected="true"]',
  )
  const selectedStickyNote = selectedSticky.locator('.component-sticky-note')

  await expect(selectedSticky).toHaveCount(1)
  await expect(selectedStickyNote).toHaveAttribute('fill', '#C2E5FF')

  const initialHeight = await getSvgNumberAttribute(
    selectedStickyNote,
    'height',
  )

  await page.locator('textarea.text-editor').fill(
    'This sticky expands when the text crosses multiple lines in the same compact object.',
  )
  await page.keyboard.press('Enter')
  await expect(page.locator('textarea.text-editor')).toHaveCount(0)
  await expect.poll(() => getSvgNumberAttribute(selectedStickyNote, 'height'))
    .toBeGreaterThan(initialHeight)
})

test('keeps connectors attached when connected objects move', async ({
  page,
}) => {
  await page.goto('/')

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')
  const arrowItems = page.locator('[data-type="arrow"]')

  await expect(arrowItems.first()).toBeVisible()

  const arrowCount = await arrowItems.count()
  const shapeBox = await getRequiredBox(shape)
  const stickyBox = await getRequiredBox(sticky)

  await page.getByRole('button', { name: 'Arrow tool' }).click()
  await page.mouse.move(
    shapeBox.x + shapeBox.width / 2,
    shapeBox.y + shapeBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    stickyBox.x + stickyBox.width / 2,
    stickyBox.y + stickyBox.height / 2,
  )
  await page.mouse.up()

  await expect.poll(() => arrowItems.count()).toBe(arrowCount + 1)

  const connectorPath = arrowItems.last().locator('.arrow-item')
  const beforeMovePath = await connectorPath.getAttribute('d')

  await sticky.click()

  const selectedStickyBox = await getRequiredBox(sticky)
  await page.mouse.move(
    selectedStickyBox.x + selectedStickyBox.width / 2,
    selectedStickyBox.y + selectedStickyBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    selectedStickyBox.x + selectedStickyBox.width / 2 + 72,
    selectedStickyBox.y + selectedStickyBox.height / 2 + 24,
  )
  await page.mouse.up()

  await expect.poll(() => connectorPath.getAttribute('d'))
    .not.toBe(beforeMovePath)
})

async function readCanvasScalePercent(page: Page) {
  const text = await page
    .locator('.engine-demo-viewport-controls [aria-label="Canvas scale"]')
    .textContent()

  return Number.parseInt(text ?? '0', 10)
}

async function openObjectToolbarMenu(page: Page, menuName: string) {
  const toolbar = page.getByRole('toolbar', { name: 'Object actions' })
  const menu = page.getByRole('group', { exact: true, name: menuName })

  if (await menu.isVisible().catch(() => false)) {
    return menu
  }

  await toolbar.getByRole('button', { exact: true, name: menuName }).click()
  await expect(menu).toBeVisible()

  return menu
}

async function clickObjectToolbarMenuAction(
  page: Page,
  menuName: string,
  actionName: string,
) {
  const menu = await openObjectToolbarMenu(page, menuName)
  await menu.getByRole('button', { exact: true, name: actionName }).click()
}

async function selectShapeAndSticky(page: Page) {
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')
  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  await page.mouse.click(stageBox.x + 12, stageBox.y + 12)
  await shape.click()
  await page.keyboard.down('Shift')
  await sticky.click()
  await page.keyboard.up('Shift')
  await expect(shape).toHaveAttribute('data-selected', 'true')
  await expect(sticky).toHaveAttribute('data-selected', 'true')
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toBeVisible()
}

async function selectShapeStickyTextAndArrow(page: Page) {
  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const sticky = page.locator('[data-canvas-item-id="engine-sticky"]')
  const text = page.locator('[data-canvas-item-id="engine-text"]')
  const arrow = page.locator('[data-canvas-item-id="engine-arrow"]')
  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  await page.mouse.click(stageBox.x + 12, stageBox.y + 12)
  await shape.click()
  await page.keyboard.down('Shift')
  await sticky.click()
  await text.click()
  await arrow.click()
  await page.keyboard.up('Shift')
  await expect(shape).toHaveAttribute('data-selected', 'true')
  await expect(sticky).toHaveAttribute('data-selected', 'true')
  await expect(text).toHaveAttribute('data-selected', 'true')
  await expect(arrow).toHaveAttribute('data-selected', 'true')
  await expect(page.getByRole('toolbar', { name: 'Object actions' }))
    .toBeVisible()
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('expected visible bounding box')
  }

  return box
}

async function getCanvasItemOrderIndex(page: Page, itemId: string) {
  return page.locator('[data-canvas-item-id]').evaluateAll(
    (elements, id) =>
      elements.findIndex((element) =>
        element.getAttribute('data-canvas-item-id') === id
      ),
    itemId,
  )
}

async function expectCanvasItemBefore(
  page: Page,
  beforeItemId: string,
  afterItemId: string,
) {
  await expect.poll(async () => {
    const [beforeIndex, afterIndex] = await Promise.all([
      getCanvasItemOrderIndex(page, beforeItemId),
      getCanvasItemOrderIndex(page, afterItemId),
    ])

    return beforeIndex < afterIndex
  }).toBe(true)
}

async function getSvgNumberAttribute(locator: Locator, attribute: string) {
  const value = await locator.getAttribute(attribute)

  if (value === null) {
    throw new Error(`expected ${attribute} attribute`)
  }

  return Number.parseFloat(value)
}

function isWithinViewport(
  box: { height: number; width: number; x: number; y: number },
  viewport: { height: number; width: number },
) {
  return box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= viewport.width &&
    box.y + box.height <= viewport.height
}

function boxesOverlap(
  first: { height: number; width: number; x: number; y: number },
  second: { height: number; width: number; x: number; y: number },
) {
  return first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
}

async function getVisibleCanvasItemArea(page: Page) {
  return page.locator('.canvas-stage [data-canvas-item-id]').evaluateAll(
    (elements) => {
      const viewport = {
        h: window.innerHeight,
        w: window.innerWidth,
      }

      return elements.reduce((area, element) => {
        const rect = element.getBoundingClientRect()
        const w = Math.max(
          0,
          Math.min(rect.right, viewport.w) - Math.max(rect.left, 0),
        )
        const h = Math.max(
          0,
          Math.min(rect.bottom, viewport.h) - Math.max(rect.top, 0),
        )

        return area + w * h
      }, 0)
    },
  )
}
