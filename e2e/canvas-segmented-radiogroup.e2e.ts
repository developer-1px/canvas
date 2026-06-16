import { expect, test, type Page } from '@playwright/test'

test('exposes DOM edit direction controls as a keyboard radiogroup', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page')
  await selectLayer(page, 'Select layer Pipeline list')

  const group = page.getByRole('radiogroup', {
    name: 'Auto layout direction',
  })
  const horizontal = group.getByRole('radio', {
    name: 'Horizontal auto layout',
  })
  const vertical = group.getByRole('radio', {
    name: 'Vertical auto layout',
  })

  await expect(vertical).toHaveAttribute('aria-checked', 'true')
  await expect(horizontal).toHaveAttribute('aria-checked', 'false')
  await vertical.focus()

  await page.keyboard.press('ArrowLeft')
  await expect(horizontal).toBeFocused()
  await expect(horizontal).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => readFlexDirection(page, 'workspacePipelineList'))
    .toBe('row')

  await page.keyboard.press('ArrowRight')
  await expect(vertical).toBeFocused()
  await expect(vertical).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => readFlexDirection(page, 'workspacePipelineList'))
    .toBe('column')
})

async function selectLayer(page: Page, buttonName: string) {
  await page.getByRole('button', { name: buttonName }).click()
}

async function readFlexDirection(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`)
    .evaluate((node) => getComputedStyle(node).flexDirection)
}
