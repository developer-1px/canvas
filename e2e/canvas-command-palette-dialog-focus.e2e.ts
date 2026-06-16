import { expect, test, type Page } from '@playwright/test'

test('traps command palette focus and restores the opener on Escape', async ({
  page,
}) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()

  const opener = page.getByRole('button', { name: 'Reset viewport' })

  await opener.focus()
  await openCommandPalette(page)

  const dialog = page.getByRole('dialog', { name: 'Command palette' })
  const input = page.getByRole('combobox', { name: 'Search commands' })

  await expect(dialog).toBeVisible()
  await expect(input).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expectCommandPaletteFocus(page)

  await page.keyboard.press('Tab')
  await expectCommandPaletteFocus(page)

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('restores the opener after backdrop close', async ({ page }) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()

  const opener = page.getByRole('button', { name: 'Reset viewport' })

  await opener.focus()
  await openCommandPalette(page)
  await expect(page.getByRole('combobox', { name: 'Search commands' }))
    .toBeFocused()

  await page.locator('.command-palette-backdrop').click({ position: {
    x: 8,
    y: 8,
  } })

  await expect(page.getByRole('dialog', { name: 'Command palette' }))
    .toHaveCount(0)
  await expect(opener).toBeFocused()
})

async function openCommandPalette(page: Page) {
  await page.keyboard.press('ControlOrMeta+K')
}

async function expectCommandPaletteFocus(page: Page) {
  await expect.poll(() =>
    page.evaluate(() =>
      document.activeElement?.closest('.command-palette') !== null
    )
  ).toBe(true)
}
