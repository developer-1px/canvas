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

test('shows compact spacing cues without filling idle gap and padding surfaces', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  const gapCue = await readSurfaceCue(
    page.locator('.figma-autolayout-gap--column').first(),
  )
  const paddingCue = await readSurfaceCue(sideHandle(page, 'top'))

  expect(gapCue.surface).toBe('rgba(0, 0, 0, 0)')
  expect(gapCue.cue.color).not.toBe('rgba(0, 0, 0, 0)')
  expect(gapCue.cue.width).toBeLessThanOrEqual(20)
  expect(gapCue.cue.height).toBeLessThanOrEqual(3)

  expect(paddingCue.surface).toBe('rgba(0, 0, 0, 0)')
  expect(paddingCue.cue.color).not.toBe('rgba(0, 0, 0, 0)')
  expect(paddingCue.cue.width).toBeLessThanOrEqual(20)
  expect(paddingCue.cue.height).toBeLessThanOrEqual(3)
})

test('expands only the hovered flex gap and anchors its value to that gap', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  const gaps = page.locator('.figma-autolayout-gap--column')
  const hoveredGap = gaps.first()
  const idleGap = gaps.nth(1)

  await hoveredGap.hover()

  const hoveredStyle = await readSurfaceCue(hoveredGap)
  const idleStyle = await readSurfaceCue(idleGap)

  expect(hoveredStyle.image).not.toBe('none')
  expect(idleStyle.image).toBe('none')
  expect(idleStyle.surface).toBe('rgba(0, 0, 0, 0)')
  expect(idleStyle.cue.color).not.toBe('rgba(0, 0, 0, 0)')

  const value = page.locator('.figma-autolayout-value--gap')
  await expect(value).toHaveText(/Gap \d+/)
  expect(await distanceBetweenCenters(hoveredGap, value)).toBeLessThan(4)
})

test('expands only the hovered padding side with its directional value', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Main area', 'workspaceMain')

  const right = sideHandle(page, 'right')
  const left = sideHandle(page, 'left')

  await right.hover()

  await expect(right).toHaveClass(/figma-autolayout-padding--active/)
  await expect(left).not.toHaveClass(/figma-autolayout-padding--active/)
  await expect(left).toHaveClass(/figma-autolayout-padding--muted/)
  await expect(page.locator('.figma-autolayout-value--padding'))
    .toHaveText(/Right \d+/)
})

test('keeps only controls relevant to the active spacing affordance', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Pipeline list', 'workspacePipelineList')

  await expect(page.getByRole('button', { name: 'Alignment editor' }))
    .toHaveCount(1)
  await page.locator('.figma-autolayout-gap').first().hover()
  await expect(page.getByRole('button', { name: 'Alignment editor' }))
    .toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-toolbar'))
    .toHaveCount(1)

  await page.mouse.move(0, 0)
  await expect(sideHandle(page, 'right')).toHaveCount(1)
  await sideHandle(page, 'right').hover()
  await expect(page.getByRole('button', { name: 'Alignment editor' }))
    .toHaveCount(0)
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-toolbar'))
    .toHaveCount(0)
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
  await page.getByRole('spinbutton', { name: 'Pad' }).fill('36')
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
  await expect(page.locator(`[data-design-node-id="${nodeId}"]`))
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
  return page.locator(`[data-design-node-id="${nodeId}"]`).evaluate((element) =>
    getComputedStyle(element).flexDirection)
}

async function readFlexGap(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`).evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).rowGap))
}

async function readSurfaceCue(locator: Locator) {
  return locator.evaluate((element) => {
    const surface = getComputedStyle(element)
    const cue = getComputedStyle(element, '::after')

    return {
      cue: {
        color: cue.backgroundColor,
        height: Number.parseFloat(cue.height),
        width: Number.parseFloat(cue.width),
      },
      image: surface.backgroundImage,
      surface: surface.backgroundColor,
    }
  })
}

async function distanceBetweenCenters(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox()
  const secondBox = await second.boundingBox()

  expect(firstBox).not.toBeNull()
  expect(secondBox).not.toBeNull()

  return Math.hypot(
    firstBox!.x + firstBox!.width / 2 - (secondBox!.x + secondBox!.width / 2),
    firstBox!.y + firstBox!.height / 2 - (secondBox!.y + secondBox!.height / 2),
  )
}

function horizontalDirection(page: Page) {
  return page.getByRole('radiogroup', { name: 'Direction' })
    .getByRole('radio', { exact: true, name: 'H' })
}

function sideHandle(page: Page, side: 'bottom' | 'left' | 'right' | 'top') {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}

function verticalDirection(page: Page) {
  return page.getByRole('radiogroup', { name: 'Direction' })
    .getByRole('radio', { exact: true, name: 'V' })
}
