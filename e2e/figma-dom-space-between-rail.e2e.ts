import { expect, test, type Locator, type Page } from '@playwright/test'

const BETWEEN_SAMPLES = [
  {
    buttonName: 'Select layer Hero panel',
    nodeId: 'workspaceHero',
  },
  {
    buttonName: 'Select layer Top bar',
    nodeId: 'workspaceTopbar',
  },
  {
    buttonName: 'Select layer Deal row 1',
    nodeId: 'workspaceDealOne',
  },
] as const

test('reveals one read-only space-between rail only on intent', async ({ page }) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  for (const sample of BETWEEN_SAMPLES) {
    await selectLayer(page, sample.buttonName, sample.nodeId)

    const lanes = betweenLanes(page)
    const laneCount = await lanes.count()

    expect(laneCount).toBeGreaterThan(0)
    await expect(betweenMarks(page)).toHaveCount(0)
    await expect(betweenRails(page)).toHaveCount(0)
    await expect(betweenTicks(page)).toHaveCount(0)
    await expect(betweenLabels(page)).toHaveCount(0)

  }

  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')
  await betweenLanes(page).first().hover()
  await expect(betweenMarks(page)).toHaveCount(1)
  await expect(betweenRails(page)).toHaveCount(1)
  await expect(betweenTicks(page)).toHaveCount(2)
  await expect(betweenLabels(page)).toHaveCount(1)
  await expect(betweenLabels(page).first())
    .toContainText(/Between \d+px actual/)

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await expect(betweenLanes(page)).toHaveCount(0)
  await expect(betweenMarks(page)).toHaveCount(0)
})

test('keeps space-between lanes read-only on pointer drag', async ({ page }) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')

  const lane = betweenLanes(page).first()
  await expect(lane).not.toHaveCount(0)
  const initialBackground = await readBackgroundColor(lane)
  const initialGap = await readFlexGap(page, 'workspaceDealOne')

  await lane.hover()
  await expect(visibleBetweenLanes(page)).toHaveCount(1)
  await expect.poll(() => readCursor(lane)).toBe('default')
  await expect.poll(() => readBackgroundColor(lane))
    .not.toBe(initialBackground)

  const laneBox = await getRequiredBox(lane)
  await page.mouse.move(centerX(laneBox), centerY(laneBox))
  await page.mouse.down()
  await page.mouse.move(centerX(laneBox) + 40, centerY(laneBox))
  await page.mouse.up()

  await expect.poll(() => readFlexGap(page, 'workspaceDealOne')).toBe(initialGap)
  await expect(betweenLabels(page).first())
    .toContainText(/Between \d+px actual/)
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

async function readBackgroundColor(locator: Locator) {
  return locator.evaluate((element) =>
    getComputedStyle(element).backgroundColor)
}

async function readCursor(locator: Locator) {
  return locator.evaluate((element) => getComputedStyle(element).cursor)
}

async function readFlexGap(page: Page, nodeId: string) {
  return page.locator(`[data-design-node-id="${nodeId}"]`).evaluate((element) =>
    getComputedStyle(element).columnGap)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function betweenLanes(page: Page) {
  return page.locator('.figma-autolayout-gap--between')
}

function visibleBetweenLanes(page: Page) {
  return page.locator(
    '.figma-autolayout-gap--between:not(.figma-autolayout-gap--empty)',
  )
}

function betweenMarks(page: Page) {
  return page.locator('[data-dom-edit-between-mark="true"]')
}

function betweenRails(page: Page) {
  return page.locator('.figma-autolayout-between-rail')
}

function betweenTicks(page: Page) {
  return page.locator('.figma-autolayout-between-tick')
}

function betweenLabels(page: Page) {
  return page.locator('.figma-autolayout-value--between')
}

function centerX(box: { width: number; x: number }) {
  return box.x + box.width / 2
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}
