import { expect, test, type Locator, type Page } from '@playwright/test'

const MENU_ITEM_SELECTOR =
  '[data-canvas-menu-item]:not(:disabled):not([aria-disabled="true"])'

test('exposes the canvas context command popup as a keyboard menu', async ({
  page,
}) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()

  const shape = page.locator('[data-canvas-item-id="engine-shape"]')
  const workspace = page.locator('.engine-demo-workspace')
  const items = page.locator('[data-canvas-item-id]')

  await shape.click()
  await workspace.focus()
  const beforeCount = await items.count()

  await page.keyboard.press('Shift+F10')

  const menu = page.getByRole('menu', { name: 'Canvas context commands' })

  await expectMenuKeyboardNavigation(page, menu)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)

  await workspace.focus()
  await page.keyboard.press('Shift+F10')
  await expect(menu).toBeVisible()
  await expect(menu.locator(MENU_ITEM_SELECTOR).first()).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(menu).toHaveCount(0)
  await expect.poll(() => items.count()).toBe(beforeCount + 1)
})

test('exposes selection toolbar dropdowns as menu buttons and menus', async ({
  page,
}) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()

  await page.locator('[data-canvas-item-id="engine-shape"]').click()

  const toolbar = page.getByRole('toolbar', { name: 'Object actions' })
  const trigger = toolbar.getByRole('button', { exact: true, name: 'Shape' })

  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const controls = await trigger.getAttribute('aria-controls')
  const menu = page.getByRole('menu', { name: 'Shape' })

  expect(controls).toBeTruthy()
  await expect(menu).toHaveAttribute('id', controls!)
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Rect shape' }))
    .toHaveAttribute('aria-checked', 'true')
  await expectMenuKeyboardNavigation(page, menu)

  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(menu).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

async function expectMenuKeyboardNavigation(page: Page, menu: Locator) {
  const items = menu.locator(MENU_ITEM_SELECTOR)

  await expect(menu).toBeVisible()
  await expect(items.first()).toBeFocused()
  await expectSingleMenuTabStop(items)

  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toBeFocused()
  await expectSingleMenuTabStop(items)

  await page.keyboard.press('End')
  await expect(items.last()).toBeFocused()
  await expectSingleMenuTabStop(items)

  await page.keyboard.press('Home')
  await expect(items.first()).toBeFocused()
  await expectSingleMenuTabStop(items)
}

async function expectSingleMenuTabStop(items: Locator) {
  const tabIndexes = await items.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('tabindex')),
  )

  expect(tabIndexes.filter((tabIndex) => tabIndex === '0')).toHaveLength(1)
  expect(tabIndexes.every((tabIndex) =>
    tabIndex === '0' || tabIndex === '-1'
  )).toBe(true)
}
