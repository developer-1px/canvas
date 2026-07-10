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

test('filters component-backed DOM nodes without a variant board', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })
  const tree = layers.getByRole('tree', { name: 'Layers' })

  await expect(layers.getByLabel('Component variants')).toHaveCount(0)

  await search.fill('stat card revenue')

  await expect(
    tree.getByRole('treeitem', { name: 'Revenue stat' }),
  ).toBeVisible()
  await expect(
    tree.getByRole('treeitem', { name: 'Deal 1' }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: 'Select layer Revenue stat' })
    .click()

  await expect(inspector).toContainText('Stat card')
  await expect(inspector).toContainText('Revenue')
})

test('keeps Figma chrome focused on the CSS inspector', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await expect(
    page.getByRole('complementary', { name: 'Imports' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('region', { name: 'Canvas devtools' }),
  ).toHaveCount(0)

  await search.fill('stat card revenue')
  await page.getByRole('button', { name: 'Select layer Revenue stat' })
    .click()

  await expect(inspector).toContainText('CSS')
  await expect(inspector).toContainText('Stat card')
})

test('focuses selected DOM layers and fits the selected frame', async ({
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

  await layers.getByRole('searchbox', { name: 'Search layers' })
    .fill('reading time')
  await layers.getByRole('button', {
    name: 'Select layer Reading time',
  }).click()

  const focusedTransform = await world.getAttribute('transform')
  expect(focusedTransform).not.toBe(zoomedTransform)

  await viewport.getByRole('button', { name: 'Zoom in' }).click()
  const refocusedZoomTransform = await world.getAttribute('transform')
  expect(refocusedZoomTransform).not.toBe(focusedTransform)

  await viewport.getByRole('button', { name: 'Fit selection' }).click()
  await expect(world).toHaveAttribute('transform', focusedTransform ?? '')
})
