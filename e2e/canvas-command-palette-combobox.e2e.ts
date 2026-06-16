import { expect, test, type Page } from '@playwright/test'

test('updates the command palette combobox active option while navigating', async ({
  page,
}) => {
  await page.goto('/?demo=engine')
  await expect(page.locator('main.engine-demo-app')).toBeVisible()
  await expect(page.getByRole('toolbar', { name: 'Engine affordances' }))
    .toBeVisible()

  await openCommandPalette(page)

  const input = page.getByRole('combobox', { name: 'Search commands' })

  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute('aria-expanded', 'true')
  await expect(input).toHaveAttribute('aria-autocomplete', 'list')

  const listboxId = await input.getAttribute('aria-controls')

  expect(listboxId).toBeTruthy()
  await expect(page.getByRole('listbox', { name: 'Command results' }))
    .toHaveAttribute('id', listboxId!)

  const initialActiveOptionId = await getActiveDescendant(input)

  await expect(optionById(page, initialActiveOptionId))
    .toHaveAttribute('role', 'option')
  await expect(optionById(page, initialActiveOptionId))
    .toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowDown')

  const nextActiveOptionId = await getActiveDescendant(input)

  expect(nextActiveOptionId).not.toBe(initialActiveOptionId)
  await expect(optionById(page, nextActiveOptionId))
    .toHaveAttribute('role', 'option')
  await expect(optionById(page, nextActiveOptionId))
    .toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowUp')

  await expect(input).toHaveAttribute(
    'aria-activedescendant',
    initialActiveOptionId,
  )
})

async function openCommandPalette(page: Page) {
  await page.keyboard.press('ControlOrMeta+K')
}

async function getActiveDescendant(
  input: ReturnType<Page['getByRole']>,
) {
  const activeOptionId = await input.getAttribute('aria-activedescendant')

  expect(activeOptionId).toBeTruthy()
  return activeOptionId!
}

function optionById(page: Page, id: string) {
  return page.locator(`[id="${id}"]`)
}
