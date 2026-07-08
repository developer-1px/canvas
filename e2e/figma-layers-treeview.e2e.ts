import { expect, test } from '@playwright/test'

test('exposes figma clone layers as a keyboard treeview', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const tree = page.getByRole('tree', { name: 'Layers' })
  const workspaceSection = tree.getByRole('treeitem', {
    name: 'Workspace page section',
  })
  const workspaceNode = tree.getByRole('treeitem', {
    exact: true,
    name: 'Workspace page',
  })
  const sectionButton = page.getByRole('button', {
    name: 'Select Workspace page section',
  })
  const workspaceButton = page.getByRole('button', {
    name: 'Select layer Workspace page',
  })

  await expect(tree).toBeVisible()
  await expect(
    tree.getByRole('treeitem', { name: 'React widget' }),
  ).toHaveAttribute('aria-posinset', '1')
  await expect(workspaceSection).toHaveAttribute('aria-level', '1')
  await expect(workspaceSection).toHaveAttribute('aria-posinset', '2')
  await expect(workspaceSection).toHaveAttribute('aria-setsize', '3')
  await expect(workspaceSection).toHaveAttribute('aria-expanded', 'true')
  await expect(workspaceSection).toHaveAttribute('aria-selected', 'true')
  await expect(workspaceNode).toHaveAttribute('aria-level', '2')
  await expect(workspaceNode).toHaveAttribute('aria-expanded', 'false')
  await expect(sectionButton).toHaveAttribute('tabindex', '0')

  await sectionButton.focus()
  await page.keyboard.press('ArrowDown')

  await expect(workspaceButton).toBeFocused()

  await page.keyboard.press('ArrowRight')

  await expect(workspaceNode).toHaveAttribute('aria-expanded', 'true')
  await expect(workspaceNode).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')

  await expect(
    page.getByRole('button', { name: 'Select layer Sidebar' }),
  ).toBeFocused()
  await expect(tree.getByRole('treeitem', { name: 'Sidebar' }))
    .toHaveAttribute('aria-level', '3')

  await page.keyboard.press('ArrowLeft')

  await expect(workspaceButton).toBeFocused()

  await page.keyboard.press('ArrowLeft')

  await expect(workspaceNode).toHaveAttribute('aria-expanded', 'false')
  await expect(workspaceSection).toHaveAttribute('aria-selected', 'true')
})

test('filters figma clone layers for component management', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const tree = page.getByRole('tree', { name: 'Layers' })
  const search = page.getByRole('searchbox', { name: 'Search layers' })

  await search.fill('newsletter')

  await expect(
    tree.getByRole('treeitem', { name: 'Editorial homepage section' }),
  ).toBeVisible()
  await expect(
    tree.getByRole('treeitem', { name: 'Workspace page section' }),
  ).toHaveCount(0)

  await search.fill('workspace')
  await expect(
    tree.getByRole('treeitem', { name: 'Workspace page section' }),
  ).toBeVisible()
  await expect(
    tree.getByRole('treeitem', { name: 'Editorial homepage section' }),
  ).toHaveCount(0)
})

test('groups figma clone components by page in a variant board', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', { name: 'Design' })
  const board = layers.getByLabel('Component variants')
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await expect(board).toBeVisible()
  await expect(
    layers.getByRole('region', { name: 'Workspace page components' }),
  ).toContainText('Stat card')
  await expect(
    layers.getByRole('region', { name: 'Editorial homepage components' }),
  ).toContainText('Article meta card')

  await search.fill('stat card')

  await expect(
    board.getByRole('button', { name: 'Select Stat card Revenue variant' }),
  ).toBeVisible()
  await expect(
    board.getByRole('button', { name: 'Select Deal row Deal 1 variant' }),
  ).toHaveCount(0)

  await board.getByRole('button', {
    name: 'Select Stat card Conversion variant',
  }).click()

  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText('Conversion')
})

test('keeps component source context in devtools without an imports rail', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await expect(
    page.getByRole('complementary', { name: 'Imports' }),
  ).toHaveCount(0)

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' })
    .click()
  await page.getByRole('button', { name: 'Inspect' }).click()

  const devtools = page.getByRole('region', { name: 'Canvas devtools' })

  await expect(devtools).toContainText('Stat card')
  await expect(devtools).toContainText('src/widgets/workspace-stat-card')
})

test('focuses figma clone component variants and fits the selected frame', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const viewport = page.getByRole('toolbar', { name: 'Viewport' })
  const world = page.locator('.canvas-stage > g')

  const initialTransform = await world.getAttribute('transform')

  await viewport.getByRole('button', { name: 'Zoom in' }).click()
  const zoomedTransform = await world.getAttribute('transform')
  expect(zoomedTransform).not.toBe(initialTransform)

  await layers.getByRole('button', {
    name: 'Select Article meta card Reading time variant',
  }).click()

  const focusedTransform = await world.getAttribute('transform')
  expect(focusedTransform).not.toBe(zoomedTransform)

  await viewport.getByRole('button', { name: 'Zoom in' }).click()
  const refocusedZoomTransform = await world.getAttribute('transform')
  expect(refocusedZoomTransform).not.toBe(focusedTransform)

  await viewport.getByRole('button', { name: 'Fit selection' }).click()
  await expect(world).toHaveAttribute('transform', focusedTransform ?? '')
})
