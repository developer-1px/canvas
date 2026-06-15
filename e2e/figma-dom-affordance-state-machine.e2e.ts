import { expect, test, type Locator, type Page } from '@playwright/test'

test('keeps DOM affordance states mutually exclusive', async ({ page }) => {
  await page.goto('/')

  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(page.locator('.figma-dom-moveable')).toHaveCount(0)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-guide-label')).toContainText(
    'Workspace page',
  )
  await expect(page.locator('.figma-guide-label')).not.toContainText(
    /W \d+|H \d+|Fill|Hug|Fixed/,
  )
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await startDrag(page, page.locator('.figma-autolayout-gap').first(), {
    x: 16,
    y: 0,
  })
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await page.mouse.up()

  await selectLayer(page, 'Select layer Hero panel', 'workspaceHero')
  await startDrag(page, sideHandle(page, 'top'), { x: 0, y: 16 })
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await page.mouse.up()
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.locator(`[data-figma-dom-node="${nodeId}"]`))
    .toHaveAttribute('data-selected', 'true')
}

async function startDrag(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await handle.boundingBox()

  expect(box).not.toBeNull()

  const x = box!.x + box!.width / 2
  const y = box!.y + box!.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

function sideHandle(page: Page, side: 'bottom' | 'left' | 'right' | 'top') {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}
