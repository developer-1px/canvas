import { expect, test, type Page } from '@playwright/test'

test('shows size source badges and updates them after mode changes', async ({
  page,
}) => {
  await page.goto('/?demo=figma')
  await page.getByRole('button', { name: 'Select layer Workspace page' })
    .click()

  await selectLayer(page, 'Select layer Pipeline panel', 'workspacePipeline')
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'data-size-source',
    'fill',
  )
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'data-parent-relative',
    'true',
  )
  await expect(heightSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /H \d+ Hug/,
  )
  await expectBadgeBelowSelection(page, 'workspacePipeline')

  await selectLayer(page, 'Select layer Hero title', 'workspaceHeroTitle')
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
  await expect(heightSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /H \d+ Hug/,
  )

  await selectLayer(page, 'Select layer Brand mark', 'workspaceBrandMark')
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fixed/,
  )
  await expect(heightSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /H \d+ Fixed/,
  )

  await selectLayer(page, 'Select layer Primary action', 'workspacePrimaryAction')
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Hug/,
  )
  await designPanel(page).getByRole('button', { name: /W \d+ Hug/ }).click()
  await expect(widthSourceBadge(page)).toHaveAttribute(
    'aria-label',
    /W \d+ Fill/,
  )
})

async function selectLayer(
  page: Page,
  buttonName: string,
  nodeId: string,
) {
  await page.getByRole('button', { name: buttonName }).click()
  await expect(page.locator(`[data-figma-dom-node="${nodeId}"]`))
    .toHaveAttribute('data-selected', 'true')
  await expect(page.locator('.figma-size-mode-capsule')).toHaveCount(1)
}

async function expectBadgeBelowSelection(page: Page, nodeId: string) {
  const selectedBox = await page.locator(`[data-figma-dom-node="${nodeId}"]`)
    .boundingBox()
  const badgeBox = await page.locator('.figma-size-mode-capsule')
    .boundingBox()

  expect(selectedBox).not.toBeNull()
  expect(badgeBox).not.toBeNull()
  expect(badgeBox!.y).toBeGreaterThanOrEqual(
    selectedBox!.y + selectedBox!.height - 1,
  )
}

function designPanel(page: Page) {
  return page.getByRole('complementary', { name: 'Design' })
}

function heightSourceBadge(page: Page) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .nth(1)
}

function widthSourceBadge(page: Page) {
  return page.locator('.figma-size-mode-capsule .figma-size-mode-control')
    .first()
}
