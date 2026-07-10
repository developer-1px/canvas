import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
} from '../packages/figma-clone/src/design-document'

const EXPECTED_PARENTS = createExpectedParents()

test('renders the canonical workspace as registered direct React DOM', async ({
  page,
}) => {
  await page.goto('/figma-dom')

  const app = page.locator('[data-figma-direct-dom="true"]')
  const nodes = page.locator('[data-design-node-id^="workspace"]')

  await expect(app).toBeVisible()
  await expect(nodes).toHaveCount(65)
  await expect(app).toHaveAttribute('data-dom-projection-count', '65')
  expect(await readDirectDomParents(page)).toEqual(EXPECTED_PARENTS)

  await expect(page.locator('svg foreignObject')).toHaveCount(0)
  await expect(page.locator('[data-canvas-item-id]')).toHaveCount(0)
  await expect(page.locator('.canvas-stage')).toHaveCount(0)
  await expect(page.locator(
    '[data-design-node-id="workspaceStatRevenue"]',
  )).toHaveAttribute('data-design-definition-id', 'workspace-stat-card')

  const viewportScale = await readNumericAttribute(app, 'data-viewport-scale')
  const tags = page.locator('[data-design-node-id="workspaceAudienceTags"]')
  const tagsBounds = await readElementBounds(tags)
  const firstRowTag = await readElementBounds(page.locator(
    '[data-design-node-id="workspaceAudienceTagEnterprise"]',
  ))
  const secondRowTag = await readElementBounds(page.locator(
    '[data-design-node-id="workspaceAudienceTagExpansion"]',
  ))

  expect(tagsBounds.width / viewportScale).toBeCloseTo(220, 1)
  expect(tagsBounds.height / viewportScale).toBeCloseTo(60, 1)
  expect(secondRowTag.y).toBeGreaterThan(firstRowTag.y)
})

test('pans, zooms, and fits registered direct DOM nodes', async ({ page }) => {
  await page.goto('/figma-dom')

  const app = page.locator('[data-figma-direct-dom="true"]')
  const stage = page.getByRole('region', { name: 'Direct DOM canvas' })
  const root = page.locator('[data-design-node-id="workspacePage"]')
  const initialRootWidth = await readElementWidth(root)
  const initialProjectedClientWidth = await readNumericAttribute(
    app,
    'data-root-client-width',
  )
  const initialProjectedWorldWidth = await readNumericAttribute(
    app,
    'data-root-world-width',
  )

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(() => readElementWidth(root)).toBeGreaterThan(
    initialRootWidth,
  )
  await expect.poll(() => readNumericAttribute(
    app,
    'data-root-client-width',
  )).toBeGreaterThan(initialProjectedClientWidth)
  await expect.poll(async () => Math.abs(
    await readNumericAttribute(app, 'data-root-world-width') -
      initialProjectedWorldWidth,
  )).toBeLessThan(0.1)
  const initialViewportX = Number(await app.getAttribute('data-viewport-x'))
  const initialViewportY = Number(await app.getAttribute('data-viewport-y'))

  const box = await stage.boundingBox()

  if (!box) {
    throw new Error('Missing direct DOM stage bounds')
  }

  const authoredButton = page.locator(
    '[data-design-node-id="workspaceNavOverview"]',
  )
  const authoredButtonBox = await authoredButton.boundingBox()

  if (!authoredButtonBox) {
    throw new Error('Missing authored React button bounds')
  }

  await page.mouse.move(
    authoredButtonBox.x + authoredButtonBox.width / 2,
    authoredButtonBox.y + authoredButtonBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    authoredButtonBox.x + authoredButtonBox.width / 2 + 40,
    authoredButtonBox.y + authoredButtonBox.height / 2 + 20,
  )
  await page.mouse.up()
  expect(Number(await app.getAttribute('data-viewport-x')))
    .toBeCloseTo(initialViewportX)
  expect(Number(await app.getAttribute('data-viewport-y')))
    .toBeCloseTo(initialViewportY)

  await page.mouse.move(box.x + 24, box.y + 100)
  await page.mouse.down({ button: 'middle' })
  await page.mouse.move(box.x + 104, box.y + 140)
  await page.mouse.up({ button: 'middle' })
  await expect.poll(async () => Number(
    await app.getAttribute('data-viewport-x'),
  )).not.toBe(initialViewportX)

  await page.getByRole('button', { name: 'Fit Revenue stat' }).click()
  await expect(app).toHaveAttribute(
    'data-viewport-focus-node-id',
    'workspaceStatRevenue',
  )
  await expectCenteredAndContained(
    stage,
    page.locator('[data-design-node-id="workspaceStatRevenue"]'),
  )
  await page.getByRole('button', { name: 'Fit page' }).click()
  await expect(app).toHaveAttribute(
    'data-viewport-focus-node-id',
    'workspacePage',
  )
  await expectCenteredAndContained(stage, root)

  const revisionBeforeResize = await readNumericAttribute(
    app,
    'data-render-revision',
  )

  await root.evaluate((element) => {
    element.style.width = '1200px'
  })

  await expect.poll(async () => Math.abs(
    await readNumericAttribute(app, 'data-root-world-width') - 1200,
  )).toBeLessThan(0.1)
  await expect.poll(() => readNumericAttribute(
    app,
    'data-render-revision',
  )).toBeGreaterThan(revisionBeforeResize)
})

test('refreshes registration on unmount and contains definition failures', async ({
  page,
}) => {
  await page.goto('/figma-dom')

  const app = page.locator('[data-figma-direct-dom="true"]')

  await page.getByRole('button', { name: 'Unmount page' }).click()
  await expect(app).toHaveAttribute('data-dom-projection-count', '0')
  await expect(page.locator('[data-design-node-id^="workspace"]'))
    .toHaveCount(0)
  await page.getByRole('button', { name: 'Mount page' }).click()
  await expect(app).toHaveAttribute('data-dom-projection-count', '65')

  await page.goto('/figma-dom?fallback=unknown')
  await expect(page.locator(
    '[data-design-render-error="unknown-definition"]',
  )).toHaveCount(1)
  await expect(page.locator('[data-design-node-id="workspaceMain"]'))
    .toBeVisible()

  await page.goto('/figma-dom?fallback=throw')
  await expect(page.locator('[data-design-render-error="render-failed"]'))
    .not.toHaveCount(0)
  await expect(page.locator('[data-design-node-id="workspaceMain"]'))
    .toBeVisible()
})

async function readElementWidth(locator: Locator) {
  return locator.evaluate((element) => element.getBoundingClientRect().width)
}

async function readElementBounds(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()

    return {
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y,
    }
  })
}

async function readNumericAttribute(locator: Locator, name: string) {
  const value = await locator.getAttribute(name)
  const number = Number(value)

  if (!value || !Number.isFinite(number)) {
    throw new Error(`Missing numeric ${name}: ${value}`)
  }

  return number
}

async function expectCenteredAndContained(
  container: Locator,
  target: Locator,
) {
  const [containerBox, targetBox] = await Promise.all([
    container.boundingBox(),
    target.boundingBox(),
  ])

  if (!containerBox || !targetBox) {
    throw new Error('Missing fit target bounds')
  }

  expect(targetBox.x).toBeGreaterThanOrEqual(containerBox.x - 1)
  expect(targetBox.y).toBeGreaterThanOrEqual(containerBox.y - 1)
  expect(targetBox.x + targetBox.width)
    .toBeLessThanOrEqual(containerBox.x + containerBox.width + 1)
  expect(targetBox.y + targetBox.height)
    .toBeLessThanOrEqual(containerBox.y + containerBox.height + 1)
  expect(Math.abs(
    targetBox.x + targetBox.width / 2 -
      (containerBox.x + containerBox.width / 2),
  )).toBeLessThan(2)
  expect(Math.abs(
    targetBox.y + targetBox.height / 2 -
      (containerBox.y + containerBox.height / 2),
  )).toBeLessThan(2)
}

async function readDirectDomParents(page: Page) {
  return page.locator('[data-design-node-id^="workspace"]').evaluateAll(
    (elements) => Object.fromEntries(elements.map((element) => {
      const nodeId = element.getAttribute('data-design-node-id') ?? ''
      const parent = element.parentElement?.closest(
        '[data-design-node-id^="workspace"]',
      )

      return [nodeId, parent?.getAttribute('data-design-node-id') ?? null]
    })),
  )
}

function createExpectedParents() {
  const parents: Record<string, string | null> = Object.fromEntries(
    FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.roots.map((rootId) => [
      rootId,
      null,
    ]),
  )

  for (const node of FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes) {
    for (const childId of node.children) {
      parents[childId] = node.id
    }
  }

  return parents
}
