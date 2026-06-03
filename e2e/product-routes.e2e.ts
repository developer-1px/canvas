import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

test('opens the product brainstorming board on /', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('main.canvas-app')).toBeVisible()
  await expect(page.locator('main.engine-demo-app')).toHaveCount(0)
  await expect(page.getByRole('toolbar', { name: 'Tools' })).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Zoom controls' }))
    .toBeVisible()
  await expect(page.locator('.canvas-status')).toContainText('select')
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

  await page.locator('[data-canvas-item-id="engine-text"]').click()

  const textEditor = page.locator(
    '[data-text-item-id="engine-text"].canvas-content-editable-text-active',
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
  await expect(page.locator('[data-canvas-item-id="engine-text"]'))
    .toContainText('Product text')
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
  await page.mouse.move(stageBox.x + 760, stageBox.y + 130)
  await page.mouse.down()
  await page.mouse.move(stageBox.x + 1020, stageBox.y + 280)
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
  await page.locator('[data-canvas-item-id="engine-shape"]').click()
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
