import { expect, test, type Locator } from '@playwright/test'

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

test('keeps Space available for focused editor controls', async ({ page }) => {
  await page.goto('/?demo=figma')

  const measureTool = page.getByRole('button', { name: 'Measure tool' })

  await measureTool.focus()
  await page.keyboard.press('Space')
  await expect(measureTool).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.figma-direct-dom__stage'))
    .toHaveAttribute('data-mode', 'select')

  const workspaceLayer = page.getByRole('button', {
    name: 'Select layer Workspace page',
  })

  await workspaceLayer.focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('treeitem', {
    exact: true,
    name: 'Workspace page',
  })).toHaveAttribute('aria-selected', 'true')
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

test('focuses selected DOM layers by root and fits the exact selection', async ({
  page,
}) => {
  await page.goto('/?demo=figma')

  const app = page.locator('.figma-clone')
  const layers = page.getByRole('complementary', { name: 'Layers' })
  const viewport = page.getByRole('toolbar', { name: 'Viewport' })
  const stage = page.locator('.figma-direct-dom__stage')
  const world = page.locator('.figma-direct-dom__world')
  const homePage = page.locator('[data-design-node-id="homePage"]')
  const readingTime = page.locator('[data-design-node-id="homeReadTime"]')

  const initialTransform = await readWorldTransform(world)

  await viewport.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(() => readWorldTransform(world)).not.toBe(initialTransform)
  const zoomedTransform = await readWorldTransform(world)
  expect(zoomedTransform).not.toBe(initialTransform)

  await layers.getByRole('searchbox', { name: 'Search layers' })
    .fill('reading time')
  await layers.getByRole('button', {
    name: 'Select layer Reading time',
  }).click()

  await expect(app).toHaveAttribute('data-selected-node-id', 'homeReadTime')
  await expect(app).toHaveAttribute(
    'data-viewport-focus-node-id',
    'homePage',
  )
  await expect.poll(() => readWorldTransform(world)).not.toBe(zoomedTransform)
  const focusedTransform = await readWorldTransform(world)
  expect(focusedTransform).not.toBe(zoomedTransform)
  await expectContained(stage, homePage)

  await viewport.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(() => readWorldTransform(world)).not.toBe(focusedTransform)
  const refocusedZoomTransform = await readWorldTransform(world)
  expect(refocusedZoomTransform).not.toBe(focusedTransform)

  await viewport.getByRole('button', { name: 'Fit selection' }).click()
  await expect(app).toHaveAttribute(
    'data-viewport-focus-node-id',
    'homeReadTime',
  )
  await expect.poll(() => readWorldTransform(world))
    .not.toBe(refocusedZoomTransform)
  await expectContained(stage, readingTime)
})

async function readWorldTransform(world: Locator) {
  return world.evaluate((element) => getComputedStyle(element).transform)
}

async function expectContained(container: Locator, target: Locator) {
  const [containerBox, targetBox] = await Promise.all([
    container.boundingBox(),
    target.boundingBox(),
  ])

  expect(containerBox).not.toBeNull()
  expect(targetBox).not.toBeNull()
  expect(targetBox!.x).toBeGreaterThanOrEqual(containerBox!.x - 1)
  expect(targetBox!.y).toBeGreaterThanOrEqual(containerBox!.y - 1)
  expect(targetBox!.x + targetBox!.width)
    .toBeLessThanOrEqual(containerBox!.x + containerBox!.width + 1)
  expect(targetBox!.y + targetBox!.height)
    .toBeLessThanOrEqual(containerBox!.y + containerBox!.height + 1)
}
