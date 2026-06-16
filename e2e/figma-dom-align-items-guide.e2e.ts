import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows flex cross-axis align-items guides', async ({ page }) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(alignGuide(page)).toHaveCount(0)
  await openAlignmentEditor(page)
  const workspacePopover = page.getByRole('region', {
    name: 'Alignment editor',
  })

  await workspacePopover.getByRole('radio', { name: 'Align stretch' }).hover()
  await expect(alignGuide(page)).toHaveAttribute('data-align-guide', 'stretch')
  await expect(alignGuide(page)).toHaveClass(/figma-align-guide--stretch/)
  await expect(alignGuide(page))
    .toHaveAttribute('data-align-guide-axis', 'horizontal')

  await selectLayer(page, 'Select layer Hero actions', 'workspaceHeroActions')
  await expect(alignGuide(page)).toHaveCount(0)
  await openAlignmentEditor(page)
  const actionsPopover = page.getByRole('region', {
    name: 'Alignment editor',
  })

  await actionsPopover.getByRole('radio', { name: 'Align center' }).hover()
  await expect(alignGuide(page)).toHaveAttribute('data-align-guide', 'center')
  await expect(alignGuide(page))
    .toHaveAttribute('data-align-guide-axis', 'horizontal')
  await expectGuideCenterY(page, 'workspaceHeroActions')

  await actionsPopover.getByRole('radio', { name: 'Align end' }).hover()
  await expect(alignGuide(page)).toHaveAttribute('data-align-guide', 'end')
  await expect(alignGuide(page))
    .toHaveAttribute('data-align-guide-preview', 'true')
  await expectGuideAtEndY(page, 'workspaceHeroActions')

  await actionsPopover.getByRole('radio', { name: 'Align start' }).hover()
  await expect(alignGuide(page)).toHaveAttribute('data-align-guide', 'start')
  await expectGuideAtStartY(page, 'workspaceHeroActions')

  await selectLayer(page, 'Select layer Hero copy', 'workspaceHeroCopy')
  await openAlignmentEditor(page)
  await page.getByRole('region', { name: 'Alignment editor' })
    .getByRole('radio', { name: 'Align center' })
    .hover()
  await expect(alignGuide(page)).toHaveAttribute('data-align-guide', 'center')
  await expect(alignGuide(page))
    .toHaveAttribute('data-align-guide-axis', 'vertical')
  await expectVerticalGuide(page)

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expect(alignGuide(page)).toHaveCount(0)
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

async function openAlignmentEditor(page: Page) {
  const trigger = page.getByRole('button', { name: 'Alignment editor' })

  await trigger.click()
  await expect(page.getByRole('region', { name: 'Alignment editor' }))
    .toBeVisible()
}

async function expectGuideCenterY(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(alignGuide(page))

  expect(Math.abs(centerY(guideBox) - centerY(nodeBox))).toBeLessThanOrEqual(1)
}

async function expectVerticalGuide(page: Page) {
  const guideBox = await getRequiredBox(alignGuide(page))

  expect(guideBox.width).toBeLessThanOrEqual(3)
  expect(guideBox.height).toBeGreaterThan(24)
}

async function expectGuideAtStartY(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(alignGuide(page))

  expect(Math.abs(guideBox.y - nodeBox.y)).toBeLessThanOrEqual(1)
}

async function expectGuideAtEndY(page: Page, nodeId: string) {
  const nodeBox = await getRequiredBox(domNode(page, nodeId))
  const guideBox = await getRequiredBox(alignGuide(page))

  expect(Math.abs(bottom(guideBox) - bottom(nodeBox))).toBeLessThanOrEqual(1)
}

async function getRequiredBox(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box).not.toBeNull()

  return box!
}

function alignGuide(page: Page) {
  return page.locator('.figma-align-guide')
}

function domNode(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`)
}

function bottom(box: { height: number; y: number }) {
  return box.y + box.height
}

function centerY(box: { height: number; y: number }) {
  return box.y + box.height / 2
}
