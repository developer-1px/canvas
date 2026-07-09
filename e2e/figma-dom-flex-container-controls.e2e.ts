import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows flex container controls only for flex containers', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(horizontalDirection(page)).toHaveAttribute('aria-checked', 'true')
  await expect(verticalDirection(page)).toHaveAttribute('aria-checked', 'false')
  await expect(page.locator('.figma-autolayout-gap--row')).toHaveCount(1)

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await expect(horizontalDirection(page)).toHaveAttribute('aria-checked', 'false')
  await expect(verticalDirection(page)).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('.figma-autolayout-gap--column').first())
    .toBeVisible()

  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')
  await expect(page.locator('.figma-autolayout-gap--column')).toHaveCount(2)

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await expect(page.locator('.figma-autolayout-gap--row')).toHaveCount(1)

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
  await expect(horizontalDirection(page)).toHaveCount(0)
  await expect(verticalDirection(page)).toHaveCount(0)
})

test('edits flex direction and shared gap from canvas controls', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  await horizontalDirection(page).click()
  await expect.poll(() => readFlexDirection(page, 'workspacePipelineList'))
    .toBe('row')
  await expect(page.locator('.figma-autolayout-gap--row')).toHaveCount(2)

  await verticalDirection(page).click()
  await expect.poll(() => readFlexDirection(page, 'workspacePipelineList'))
    .toBe('column')
  await expect(page.locator('.figma-autolayout-gap--column')).toHaveCount(2)

  const initialGap = await readFlexGap(page, 'workspacePipelineList')
  await dragHandle(page, page.locator('.figma-autolayout-gap--column').first(), {
    x: 0,
    y: 18,
  })

  await expect.poll(() => readFlexGap(page, 'workspacePipelineList'))
    .toBeGreaterThan(initialGap)
  await expect(page.locator('.figma-autolayout-gap--column')).toHaveCount(2)
})

test('scales padding bands and keeps gap/padding active states exclusive', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Main area', 'workspaceMain')

  const initialPaddingHeight = await readBoxHeight(sideHandle(page, 'top'))
  await page.getByRole('spinbutton', { name: 'CSS padding' }).fill('36')
  await expect.poll(() => readBoxHeight(sideHandle(page, 'top')))
    .toBeGreaterThan(initialPaddingHeight + 2)

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await startDrag(page, page.locator('.figma-autolayout-gap').first(), {
    x: 16,
    y: 0,
  })
  await expect(page.locator('.figma-autolayout-padding')).toHaveCount(0)
  await page.mouse.up()

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await startDrag(page, sideHandle(page, 'top'), { x: 0, y: 16 })
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)
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

async function dragHandle(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  await startDrag(page, handle, delta)
  await page.mouse.up()
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

async function readBoxHeight(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!.height
}

async function readFlexDirection(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`).evaluate((element) =>
    getComputedStyle(element).flexDirection)
}

async function readFlexGap(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`).evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).rowGap))
}

function horizontalDirection(page: Page) {
  return page.getByRole('radio', { name: 'Horizontal auto layout' })
}

function sideHandle(page: Page, side: 'bottom' | 'left' | 'right' | 'top') {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}

function verticalDirection(page: Page) {
  return page.getByRole('radio', { name: 'Vertical auto layout' })
}
