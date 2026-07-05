import { expect, test, type Locator, type Page } from '@playwright/test'

const TOOLBAR_ITEM_SELECTOR =
  '[data-canvas-toolbar-item]:not(:disabled):not([aria-disabled="true"])'

test('keeps engine demo toolbars on one tab stop with arrow navigation', async ({
  page,
}) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()

  await expectToolbarRovingFocus(
    page,
    page.getByRole('toolbar', { name: 'Engine affordances' }),
  )
  await expectToolbarRovingFocus(
    page,
    page.getByRole('toolbar', { name: 'Viewport controls' }),
  )

})

test('keeps figma clone toolbars on one tab stop with arrow navigation', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await expect(page.locator('.figma-clone')).toBeVisible()

  await expectToolbarRovingFocus(
    page,
    page.locator('.figma-canvas-toolbar'),
  )
  await expectToolbarRovingFocus(
    page,
    page.getByRole('toolbar', { name: 'Viewport' }),
  )
})

async function expectToolbarRovingFocus(page: Page, toolbar: Locator) {
  const items = toolbar.locator(TOOLBAR_ITEM_SELECTOR)

  await expect(toolbar).toBeVisible()
  await expect(items.first()).toHaveAttribute('tabindex', '0')
  expect(await items.count()).toBeGreaterThan(1)
  await expectSingleToolbarTabStop(items)

  await items.first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(items.nth(1)).toBeFocused()
  await expectSingleToolbarTabStop(items)

  await page.keyboard.press('End')
  await expect(items.last()).toBeFocused()
  await expectSingleToolbarTabStop(items)

  await page.keyboard.press('Home')
  await expect(items.first()).toBeFocused()
  await expectSingleToolbarTabStop(items)
}

async function expectSingleToolbarTabStop(items: Locator) {
  const tabIndexes = await items.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('tabindex')),
  )

  expect(tabIndexes.filter((tabIndex) => tabIndex === '0')).toHaveLength(1)
  expect(tabIndexes.every((tabIndex) =>
    tabIndex === '0' || tabIndex === '-1'
  )).toBe(true)
}
