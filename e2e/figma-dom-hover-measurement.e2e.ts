import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows selected-to-hover DOM measurement redlines', async ({ page }) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Revenue stat' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()

  await expect.poll(() => page.locator('.figma-guide-distance--inset').count())
    .toBeGreaterThan(0)
  await expectMeasurementColor(page.locator('.figma-guide-distance').first())
  await expectDistanceLabelsFollowPan(page, 'workspaceStatRevenue')

  await page.locator('[data-design-node-id="workspaceStatConversion"]').hover()
  await expect.poll(() => page.locator('.figma-guide-distance--gap').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-guide-distance span').first())
    .toContainText(/\d+ px/)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)

  await page.keyboard.down('Alt')
  await page.locator('[data-design-node-id="workspaceStatConversion"]').hover()
  await expect.poll(() => page.locator('.figma-guide-distance--gap').count())
    .toBeGreaterThan(0)
  await page.keyboard.up('Alt')
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
})

test('keeps DOM measurement redlines and spacing affordances exclusive', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await page.getByRole('button', { name: 'Select layer Hero actions' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-guide-distance').count())
    .toBeGreaterThan(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(page.locator('.figma-autolayout-gap')).toHaveCount(1)

  await startDrag(page, page.locator('.figma-autolayout-gap').first(), {
    x: 16,
    y: 0,
  })
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await page.mouse.up()

  await page.getByRole('button', { name: 'Select layer Hero panel' }).click()
  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect.poll(() => page.locator('.figma-guide-distance').count())
    .toBeGreaterThan(0)
  await expect(sideHandle(page, 'top')).toHaveCount(0)

  await page.getByRole('button', { name: 'Measure tool' }).click()
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await expect(sideHandle(page, 'top')).toHaveCount(1)

  await startDrag(page, sideHandle(page, 'top'), { x: 0, y: 16 })
  await expect(page.locator('.figma-guide-distance')).toHaveCount(0)
  await page.mouse.up()
})

async function expectDistanceLabelsFollowPan(page: Page, nodeId: string) {
  const selected = page.locator(`[data-design-node-id="${nodeId}"]`)
  const beforeSelected = await getRequiredBox(selected)
  const beforeLabel = await getRequiredBox(
    page.locator('.figma-guide-distance span').first(),
  )

  await page.keyboard.press('h')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'pan')
  await panCanvas(page, { x: 36, y: 18 })

  await expect.poll(async () => {
    const afterSelected = await getRequiredBox(selected)

    return Math.abs(afterSelected.x - beforeSelected.x) +
      Math.abs(afterSelected.y - beforeSelected.y)
  }).toBeGreaterThan(1)

  const afterSelected = await getRequiredBox(selected)
  const afterLabel = await getRequiredBox(
    page.locator('.figma-guide-distance span').first(),
  )

  expectClose(afterLabel.x - beforeLabel.x, afterSelected.x - beforeSelected.x)
  expectClose(afterLabel.y - beforeLabel.y, afterSelected.y - beforeSelected.y)

  await page.keyboard.press('v')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'select')
}

async function expectMeasurementColor(locator: Locator) {
  await expect.poll(() =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor)
  ).toBe('rgb(220, 38, 38)')
}

async function panCanvas(
  page: Page,
  delta: { x: number; y: number },
) {
  const stageBox = await getRequiredBox(
    page.locator('.figma-direct-dom__stage'),
  )
  const x = stageBox.x + 120
  const y = stageBox.y + 120

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 6 })
  await page.mouse.up()
}

async function startDrag(
  page: Page,
  handle: Locator,
  delta: { x: number; y: number },
) {
  const box = await getRequiredBox(handle)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2

  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + delta.x, y + delta.y, { steps: 4 })
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function expectClose(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)
}

function sideHandle(page: Page, side: 'bottom' | 'left' | 'right' | 'top') {
  return page.locator(`[data-dom-edit-padding-kind="padding-${side}"]`)
}
