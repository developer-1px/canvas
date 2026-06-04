import type {
  Locator,
  Page,
} from '@playwright/test'
import { expect, test } from '@playwright/test'

const WORKSPACE_STORAGE_KEY = 'interactive-os.canvas.workspace.v1'

test('opens the product brainstorming board on /', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('main.canvas-app')).toBeVisible()
  await expect(page.locator('main.engine-demo-app')).toHaveCount(0)
  await expect(page.getByRole('toolbar', { name: 'Tools' })).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Zoom controls' }))
    .toBeVisible()
  await expect(page.locator('.canvas-status')).toContainText('select')
  await expect(page.locator('[data-canvas-item-id="product-board-title"]'))
    .toContainText('Launch workshop')
  await expect(page.locator('[data-canvas-item-id="product-section-signals"]'))
    .toContainText('Signals')
  await expect(page.locator(
    '[data-canvas-item-id="product-section-experiments"]',
  ))
    .toContainText('Experiments')
  await expect(page.locator('[data-canvas-item-id="engine-section"]'))
    .toHaveCount(0)
})

test('keeps the engine verification demo on /engine', async ({ page }) => {
  await page.goto('/engine')

  await expect(page.locator('main.engine-demo-app')).toBeVisible()
  await expect(page.locator('main.canvas-app')).toHaveCount(0)
  await expect(page.getByRole('toolbar', {
    name: 'Engine affordances',
  })).toBeVisible()
  await expect(page.getByRole('toolbar', {
    name: 'Viewport controls',
  })).toBeVisible()
})

test('selects free text into immediate contenteditable editing on /', async ({
  page,
}) => {
  await page.goto('/')

  await page.locator('[data-canvas-item-id="product-text"]').click()

  const textEditor = page.locator(
    '[data-text-item-id="product-text"].canvas-content-editable-text-active',
  )

  await expect(textEditor).toBeVisible()
  await textEditor.fill('Product text')
  await textEditor.press('Enter')
  await expect.poll(async () => {
    const text = await textEditor.evaluate((element) => element.textContent)

    return text?.startsWith('Product text') === true &&
      text.includes('\n')
  }).toBe(true)
  await textEditor.press('Escape')
  await expect(textEditor).toHaveCount(0)
  await expect(page.locator('[data-canvas-item-id="product-text"]'))
    .toContainText('Product text')
})

test('creates multiline sticky notes and arrows on /', async ({ page }) => {
  await page.goto('/')

  const stageBox = await getRequiredStageBox(page)
  const stickies = page.locator(
    '[data-type="component"][data-component="sticky"]',
  )
  const stickyCount = await stickies.count()

  await page.getByRole('button', { name: 'Sticky note tool' }).click()
  await page.mouse.click(stageBox.x + 720, stageBox.y + 210)
  await expect.poll(() => stickies.count()).toBeGreaterThan(stickyCount)

  const stickyEditor = page.locator(
    '.component-sticky-body.canvas-content-editable-text-active',
  )

  await expect(stickyEditor).toBeVisible()
  await stickyEditor.fill('Product note')
  await stickyEditor.press('Enter')
  await expect.poll(async () => {
    const text = await stickyEditor.evaluate((element) => element.textContent)

    return text?.startsWith('Product note') === true &&
      text.includes('\n')
  }).toBe(true)
  await stickyEditor.press('Escape')
  await expect(stickyEditor).toHaveCount(0)
  await expect(stickies.last()).toContainText('Product note')

  const arrowCount = await page.locator('[data-type="arrow"]').count()

  await page.getByRole('button', { name: 'Arrow tool' }).click()
  await page.mouse.move(stageBox.x + 708, stageBox.y + 220)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 812, stageBox.y + 270)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="arrow"]').count())
    .toBeGreaterThan(arrowCount)
})

test('chains sticky notes with quick-create on /', async ({ page }) => {
  await page.goto('/')

  const stickies = page.locator(
    '[data-type="component"][data-component="sticky"]',
  )
  const arrows = page.locator('[data-type="arrow"]')
  const sourceSticky = page.locator(
    '[data-canvas-item-id="product-sticky-examples"]',
  )
  const occupiedSticky = page.locator(
    '[data-canvas-item-id="product-sticky-undo"]',
  )

  await expect(sourceSticky).toBeVisible()
  await expect(occupiedSticky).toBeVisible()

  const stickyCount = await stickies.count()
  const arrowCount = await arrows.count()
  const occupiedBox = await getRequiredElementBox(occupiedSticky)

  await sourceSticky.click()

  const quickCreateRight = page.getByRole('button', {
    name: 'Create sticky note right',
  })

  await expect(quickCreateRight).toBeVisible()
  await quickCreateRight.click()
  await expect.poll(() => stickies.count()).toBe(stickyCount + 1)
  await expect.poll(() => arrows.count()).toBe(arrowCount + 1)

  const stickyEditor = page.locator(
    '.component-sticky-body.canvas-content-editable-text-active',
  )

  await expect(stickyEditor).toBeVisible()
  await stickyEditor.fill('Next experiment')
  await stickyEditor.press('Escape')
  await expect(stickyEditor).toHaveCount(0)

  const newSticky = stickies.last()

  await expect(newSticky).toContainText('Next experiment')
  expect(doElementBoxesOverlap(
    await getRequiredElementBox(newSticky),
    occupiedBox,
  )).toBe(false)
})

test('persists product board edits across reloads on /', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-canvas-item-id="product-text"]').click()
  const textEditor = page.locator(
    '[data-text-item-id="product-text"].canvas-content-editable-text-active',
  )

  await expect(textEditor).toBeVisible()
  await textEditor.fill('Product persisted text')
  await textEditor.press('Escape')

  const stamps = page.locator('[data-type="stamp"]')
  const stampCount = await stamps.count()

  await page.locator('[data-canvas-item-id="product-decision-shape"]').click()
  await page.getByRole('button', { name: 'Thumbs up' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 1)
  await expect.poll(() =>
    page.evaluate((key) => localStorage.getItem(key), WORKSPACE_STORAGE_KEY),
  ).toContain('Product persisted text')

  await page.reload()

  await expect(page.locator('[data-canvas-item-id="product-text"]'))
    .toContainText('Product persisted text')
  await expect(page.locator('[data-type="stamp"]')).toHaveCount(stampCount + 1)
})

test('supports organize and mark workflows on /', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Section tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Comment tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Arrow tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Marker tool' }))
    .toBeVisible()
  await expect(page.getByRole('button', { name: 'Highlighter tool' }))
    .toBeVisible()
  await expect(page.locator('.stamp-controls')).toBeVisible()

  const stageBox = await getRequiredStageBox(page)
  const sections = page.locator(
    '[data-type="component"][data-component="section"]',
  )
  const sectionCount = await sections.count()

  await page.getByRole('button', { name: 'Section tool' }).click()
  await page.mouse.move(stageBox.x + 1088, stageBox.y + 464)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 1240, stageBox.y + 612)
  await page.mouse.up()
  await expect.poll(() => sections.count()).toBeGreaterThan(sectionCount)
  await page.keyboard.press('Escape')

  const comments = page.locator('[data-type="comment"]')
  const commentCount = await comments.count()

  await page.getByRole('button', { name: 'Comment tool' }).click()
  await page.mouse.click(stageBox.x + 820, stageBox.y + 330)
  await expect.poll(() => comments.count()).toBe(commentCount + 1)
  await page.locator('textarea.text-editor').fill('Review this')
  await page.keyboard.press('Enter')
  await expect(comments.last().locator('.comment-body-card'))
    .toContainText('Review this')

  const stamps = page.locator('[data-type="stamp"]')
  const stampCount = await stamps.count()

  await page.getByRole('button', { name: 'Select tool' }).click()
  await page.locator('[data-canvas-item-id="product-decision-shape"]').click()
  await page.getByRole('button', { name: 'Thumbs up' }).click()
  await expect.poll(() => stamps.count()).toBe(stampCount + 1)

  const markerCount = await page.locator('[data-type="marker"]').count()

  await page.getByRole('button', { name: 'Marker tool' }).click()
  await expect(page.getByLabel('Marker controls')).toBeVisible()
  await page.mouse.move(stageBox.x + 700, stageBox.y + 420)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 760, stageBox.y + 448)
  await page.mouse.move(stageBox.x + 825, stageBox.y + 420)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="marker"]').count())
    .toBeGreaterThan(markerCount)

  const highlightCount = await page.locator('[data-type="highlight"]').count()

  await page.getByRole('button', { name: 'Highlighter tool' }).click()
  await expect(page.getByLabel('Highlighter controls')).toBeVisible()
  await page.mouse.move(stageBox.x + 690, stageBox.y + 470)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 770, stageBox.y + 494)
  await page.mouse.move(stageBox.x + 840, stageBox.y + 468)
  await page.mouse.up()
  await expect.poll(() => page.locator('[data-type="highlight"]').count())
    .toBeGreaterThan(highlightCount)
})

async function getRequiredStageBox(page: Page) {
  const stageBox = await page.locator('.canvas-stage').boundingBox()

  if (!stageBox) {
    throw new Error('expected canvas stage')
  }

  return stageBox
}

async function getRequiredElementBox(locator: Locator) {
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('expected element bounds')
  }

  return box
}

function doElementBoxesOverlap(
  a: { height: number; width: number; x: number; y: number },
  b: { height: number; width: number; x: number; y: number },
) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
}
