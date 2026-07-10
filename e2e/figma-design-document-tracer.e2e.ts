import { expect, test, type Page } from '@playwright/test'
import {
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
} from '../packages/figma-clone/src/design-document'

const EXPECTED_WORKSPACE_PARENTS = createExpectedWorkspaceParents()
const EXPECTED_WORKSPACE_INTRINSICS = Object.fromEntries(
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes.flatMap((node) =>
    node.definition.kind === 'intrinsic'
      ? [[node.id, node.definition.id]]
      : []),
)

test('keeps the migrated workspace canonical across edit, history, and page switches', async ({
  page,
}) => {
  await page.goto('/figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const search = layers.getByRole('searchbox', { name: 'Search layers' })

  await expect(page.locator('[data-figma-dom-node^="workspace"]'))
    .toHaveCount(65)
  await layers.getByRole('button', { name: 'Select layer Workspace page' })
    .click()
  await expect(layers.locator('[data-figma-layer-node-id^="workspace"]'))
    .toHaveCount(65)
  expect(await readWorkspaceDomParents(page))
    .toEqual(EXPECTED_WORKSPACE_PARENTS)
  expect(await readWorkspaceLayerParents(page))
    .toEqual(EXPECTED_WORKSPACE_PARENTS)
  expect(await readWorkspaceIntrinsicTags(page))
    .toMatchObject(EXPECTED_WORKSPACE_INTRINSICS)

  await search.fill('revenue label')
  await layers.getByRole('button', { name: 'Select layer Revenue label' })
    .click()

  const revenueLabel = page.locator(
    '[data-figma-dom-node="workspaceStatRevenueLabel"]',
  )
  const textEditor = inspector.getByLabel('CSS text content')

  await expect(revenueLabel).toHaveAttribute('data-selected', 'true')
  await expect(textEditor).toHaveValue('Revenue')
  await textEditor.fill('Canonical revenue')
  await expect(revenueLabel).toContainText('Canonical revenue')

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(textEditor).toHaveValue('Revenue')
  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(textEditor).toHaveValue('Canonical revenue')

  await search.fill('hero actions')
  const heroActionsLayer = layers.locator(
    '[data-figma-layer-node-id="workspaceHeroActions"]',
  )
  await heroActionsLayer.click()
  await inspector.getByLabel('CSS flex-direction').selectOption('column')
  await expect(page.locator(
    '[data-figma-dom-node="workspaceHeroActions"]',
  )).toHaveCSS('flex-direction', 'column')

  await search.fill('')
  const homeSection = layers.getByRole('button', {
    name: 'Select Editorial homepage section',
  })
  await homeSection.click()
  await expect(homeSection.locator('xpath=..'))
    .toHaveAttribute('aria-selected', 'true')

  await layers.getByRole('button', {
    name: 'Select Workspace page section',
  }).click()
  await search.fill('hero actions')
  await heroActionsLayer.click()

  await page.keyboard.press(`${primaryModifier()}+Z`)
  await expect(page.locator(
    '[data-figma-dom-node="workspaceHeroActions"]',
  )).toHaveCSS('flex-direction', 'row')
  await expect(heroActionsLayer.locator('xpath=..'))
    .toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(page.locator(
    '[data-figma-dom-node="workspaceHeroActions"]',
  )).toHaveCSS('flex-direction', 'column')

  await search.fill('revenue label')
  await layers.getByRole('button', { name: 'Select layer Revenue label' })
    .click()
  await expect(inspector.getByLabel('CSS text content'))
    .toHaveValue('Canonical revenue')
})

test('keeps workspace frame settings separate from the legacy page', async ({
  page,
}) => {
  await page.goto('/figma')

  const layers = page.getByRole('complementary', { name: 'Layers' })
  const inspector = page.getByRole('complementary', {
    name: 'CSS Inspector',
  })
  const workspaceSection = layers.getByRole('button', {
    name: 'Select Workspace page section',
  })
  const homeSection = layers.getByRole('button', {
    name: 'Select Editorial homepage section',
  })
  const workspaceCanvasFrame = page.locator(
    '[data-canvas-item-id="figma-dom-workspace-frame"]',
  )

  await workspaceSection.click()
  const initialCanvasWidth = await workspaceCanvasFrame.evaluate(
    (element) => element.getBoundingClientRect().width,
  )
  await inspector.getByRole('button', { name: /Mobile/ }).click()
  await expect(inspector.getByLabel('W')).toHaveValue('390')
  await expect.poll(() => workspaceCanvasFrame.evaluate(
    (element) => element.getBoundingClientRect().width,
  )).toBeLessThan(initialCanvasWidth)

  await homeSection.click()
  await expect(inspector.getByLabel('W')).toHaveValue('1280')

  await workspaceSection.click()
  await expect(inspector.getByLabel('W')).toHaveValue('390')
})

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}

async function readWorkspaceDomParents(page: Page) {
  return page.locator('[data-figma-dom-node^="workspace"]').evaluateAll(
    (elements) => Object.fromEntries(elements.map((element) => {
      const nodeId = element.getAttribute('data-figma-dom-node') ?? ''
      const parent = element.parentElement?.closest(
        '[data-figma-dom-node^="workspace"]',
      )

      return [nodeId, parent?.getAttribute('data-figma-dom-node') ?? null]
    })),
  )
}

async function readWorkspaceLayerParents(page: Page) {
  return page.locator('[data-figma-layer-node-id^="workspace"]').evaluateAll(
    (elements) => Object.fromEntries(elements.map((element) => {
      const nodeId = element.getAttribute('data-figma-layer-node-id') ?? ''
      const parentTreeId = element.getAttribute(
        'data-figma-layer-parent-tree-id',
      )

      return [
        nodeId,
        parentTreeId?.startsWith('node:')
          ? parentTreeId.slice('node:'.length)
          : null,
      ]
    })),
  )
}

async function readWorkspaceIntrinsicTags(page: Page) {
  return page.locator('[data-figma-dom-node^="workspace"]').evaluateAll(
    (elements) => Object.fromEntries(elements.map((element) => [
      element.getAttribute('data-figma-dom-node') ?? '',
      element.tagName.toLowerCase(),
    ])),
  )
}

function createExpectedWorkspaceParents() {
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
