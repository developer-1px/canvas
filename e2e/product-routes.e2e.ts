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
