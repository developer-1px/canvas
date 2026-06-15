import { expect, test, type Locator, type Page } from '@playwright/test'

test('shows flex child sizing only inside flex parents', async ({ page }) => {
  await page.goto('/')

  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
  await expect(sizeOption(page, 'W Fill')).toHaveCount(0)
  await expect(flexChildAlignSelf(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Sidebar', 'workspaceSidebar')
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Hug/,
  )
  await expect(sizeOption(page, 'W Fill')).toHaveCount(1)
  await expect(sizeOption(page, 'W Fill')).toBeHidden()
  await expect(flexChildAlignSelf(page)).toHaveCount(1)
  await widthModeBadge(page).hover()
  await expect(sizeOption(page, 'W Fill')).toBeVisible()
  await expect(flexChildAlignSelf(page)).toHaveCount(0)

  await selectLayer(page, 'Select layer Main area', 'workspaceMain')
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(sizeOption(page, 'W Fill')).toHaveCount(1)
  await expect(flexChildAlignSelf(page)).toHaveCount(1)

  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(sizeOption(page, 'W Fill')).toHaveCount(1)
  await expect(flexChildAlignSelf(page)).toHaveCount(1)

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(widthModeBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(sizeOption(page, 'W Fill')).toHaveCount(0)
  await expect(flexChildAlignSelf(page)).toHaveCount(0)
})

test('shows margin outside selected bounds without mixing with container gap', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')
  await selectLayer(page, 'Select layer Deal row 1', 'workspaceDealOne')

  await page.getByRole('spinbutton', { name: 'Mar' }).fill('10')
  await expect(marginGhost(page)).toHaveCount(4)
  await expectMarginOutsideSelection(page, 'workspaceDealOne')

  await page.locator('.figma-autolayout-gap').first().hover()
  await expect(marginGhost(page)).toHaveCount(0)
  await expect(flexChildAlignSelf(page)).toHaveCount(0)
})

test('shows align-self cross-axis guide from the child marker', async ({
  page,
}) => {
  await page.goto('/')
  await selectLayer(page, 'Select layer Workspace page', 'workspacePage')

  await expectAlignSelfGuide(page, 'Select layer Sidebar', {
    effectiveAlign: 'stretch',
    nodeId: 'workspaceSidebar',
  })
  await expectAlignSelfGuide(page, 'Select layer Main area', {
    effectiveAlign: 'stretch',
    nodeId: 'workspaceMain',
  })
  await expectAlignSelfGuide(page, 'Select layer Deal row 1', {
    effectiveAlign: 'stretch',
    nodeId: 'workspaceDealOne',
  })
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

async function expectMarginOutsideSelection(page: Page, nodeId: string) {
  const selectedBox = await selectedNode(page, nodeId).boundingBox()

  expect(selectedBox).not.toBeNull()

  await expectBandOutsideSelection(
    marginGhostSide(page, 'top'),
    selectedBox!,
    'top',
  )
  await expectBandOutsideSelection(
    marginGhostSide(page, 'right'),
    selectedBox!,
    'right',
  )
  await expectBandOutsideSelection(
    marginGhostSide(page, 'bottom'),
    selectedBox!,
    'bottom',
  )
  await expectBandOutsideSelection(
    marginGhostSide(page, 'left'),
    selectedBox!,
    'left',
  )
}

async function expectBandOutsideSelection(
  band: Locator,
  selectedBox: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>,
  side: 'bottom' | 'left' | 'right' | 'top',
) {
  const bandBox = await band.boundingBox()

  expect(bandBox).not.toBeNull()

  if (side === 'top') {
    expect(bandBox!.y + bandBox!.height).toBeLessThanOrEqual(selectedBox.y + 1)
    return
  }

  if (side === 'right') {
    expect(bandBox!.x).toBeGreaterThanOrEqual(
      selectedBox.x + selectedBox.width - 1,
    )
    return
  }

  if (side === 'bottom') {
    expect(bandBox!.y).toBeGreaterThanOrEqual(
      selectedBox.y + selectedBox.height - 1,
    )
    return
  }

  expect(bandBox!.x + bandBox!.width).toBeLessThanOrEqual(selectedBox.x + 1)
}

async function expectAlignSelfGuide(
  page: Page,
  buttonName: string,
  {
    effectiveAlign,
    nodeId,
  }: {
    effectiveAlign: string
    nodeId: string
  },
) {
  await selectLayer(page, buttonName, nodeId)
  await expect(flexChildAlignSelf(page)).toHaveAttribute(
    'data-align-effective',
    effectiveAlign,
  )
  await expect(alignSelfGuide(page)).toHaveCount(0)
  await flexChildAlignSelf(page).hover()
  await expect(alignSelfGuide(page)).toHaveCount(1)
  await expect(alignSelfGuide(page)).toHaveAttribute(
    'data-align-effective',
    effectiveAlign,
  )
}

function alignSelfGuide(page: Page) {
  return page.locator('[data-align-self-guide="true"]')
}

function flexChildAlignSelf(page: Page) {
  return page.locator('.figma-flex-child-align-self')
}

function marginGhost(page: Page) {
  return page.locator('.figma-margin-ghost[data-margin-ghost-owner="selected"]')
}

function marginGhostSide(
  page: Page,
  side: 'bottom' | 'left' | 'right' | 'top',
) {
  return page.locator(
    `.figma-margin-ghost[data-margin-ghost-owner="selected"][data-margin-side="${side}"]`,
  )
}

function selectedNode(page: Page, nodeId: string) {
  return page.locator(`[data-figma-dom-node="${nodeId}"]`)
}

function sizeOption(page: Page, label: string) {
  return page.locator(`.figma-size-mode-control__choices button[aria-label="${label}"]`)
}

function widthModeBadge(page: Page) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .first()
}
