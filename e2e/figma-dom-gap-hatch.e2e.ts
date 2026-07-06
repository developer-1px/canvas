import { expect, test, type Locator, type Page } from '@playwright/test'

test('uses hatch patterns for fixed flex and grid gaps', async ({ page }) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  const fixedGap = page.locator('.figma-autolayout-gap').first()

  await fixedGap.hover()
  await expect(fixedGap).not.toHaveClass(/figma-autolayout-gap--between/)
  await expect.poll(() => readBackgroundImage(fixedGap))
    .toContain('repeating-linear-gradient')

  const fixedGapBox = await getRequiredBox(fixedGap)
  await page.mouse.move(centerX(fixedGapBox), centerY(fixedGapBox))
  await page.mouse.down()
  await page.mouse.move(centerX(fixedGapBox) + 14, centerY(fixedGapBox))
  await expect(page.locator('.figma-autolayout-value--gap')).toContainText(/Gap/)
  await expect.poll(() => readBackgroundImage(fixedGap))
    .toContain('repeating-linear-gradient')
  await page.mouse.up()

  await selectLayer(page, 'Select layer Hero panel', 'workspaceHero')
  const betweenGap = page.locator('.figma-autolayout-gap--between').first()

  await betweenGap.hover()
  await expect.poll(() => readBackgroundImage(betweenGap))
    .not.toContain('repeating-linear-gradient')

  await selectLayer(page, 'Select layer Content grid', 'workspaceContent')
  const gridGap = page.locator('.figma-grid-gap').first()

  await gridGap.hover()
  await expect.poll(() => readBackgroundImage(gridGap))
    .toContain('repeating-linear-gradient')
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

async function readBackgroundImage(locator: Locator) {
  return locator.evaluate((element) =>
    getComputedStyle(element).backgroundImage)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function centerX(box: { width: number; x: number }) {
  return box.x + box.width / 2
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}
