import { expect, test, type Page } from '@playwright/test'
import {
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT,
} from '../packages/figma-clone/src/design-document'

const EXPECTED_WORKSPACE_PARENTS = createExpectedWorkspaceParents()
const EXPECTED_WORKSPACE_INTRINSICS = Object.fromEntries(
  FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes.flatMap((node) =>
    node.id.startsWith('workspace') && node.definition.kind === 'intrinsic'
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

  await expect(page.locator('[data-design-node-id^="workspace"]'))
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
    '[data-design-node-id="workspaceStatRevenueLabel"]',
  )
  const textEditor = inspector.getByLabel('Text')

  await expect(page.locator('.figma-clone'))
    .toHaveAttribute('data-selected-node-id', 'workspaceStatRevenueLabel')
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
  await inspector.getByRole('radiogroup', { name: 'Direction' })
    .getByRole('radio', { name: 'V', exact: true })
    .click()
  await expect(page.locator(
    '[data-design-node-id="workspaceHeroActions"]',
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
    '[data-design-node-id="workspaceHeroActions"]',
  )).toHaveCSS('flex-direction', 'row')
  await expect(heroActionsLayer.locator('xpath=..'))
    .toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press(`${primaryModifier()}+Shift+Z`)
  await expect(page.locator(
    '[data-design-node-id="workspaceHeroActions"]',
  )).toHaveCSS('flex-direction', 'column')

  await search.fill('revenue label')
  await layers.getByRole('button', { name: 'Select layer Revenue label' })
    .click()
  await expect(inspector.getByLabel('Text'))
    .toHaveValue('Canonical revenue')
})

test('keeps canonical page frame settings independent', async ({
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
    '[data-design-node-id="workspacePage"]',
  )
  const frameWidth = inspector.getByRole('heading', { name: 'Viewport' })
    .locator('..')
    .getByLabel('W', { exact: true })

  await workspaceSection.click()
  const initialCanvasWidth = await workspaceCanvasFrame.evaluate(
    (element) => element.getBoundingClientRect().width,
  )
  await inspector.getByRole('button', { name: /Mobile/ }).click()
  await expect(frameWidth).toHaveValue('390')
  await expect.poll(() => workspaceCanvasFrame.evaluate(
    (element) => element.getBoundingClientRect().width,
  )).toBeLessThan(initialCanvasWidth)

  await homeSection.click()
  await expect(frameWidth).toHaveValue('1280')

  await workspaceSection.click()
  await expect(frameWidth).toHaveValue('390')
})

function primaryModifier() {
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}

async function readWorkspaceDomParents(page: Page) {
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
  return page.locator('[data-design-node-id^="workspace"]').evaluateAll(
    (elements) => Object.fromEntries(elements.map((element) => [
      element.getAttribute('data-design-node-id') ?? '',
      element.tagName.toLowerCase(),
    ])),
  )
}

function createExpectedWorkspaceParents() {
  const parents: Record<string, string | null> = Object.fromEntries(
    FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.roots
      .filter((rootId) => rootId.startsWith('workspace'))
      .map((rootId) => [rootId, null]),
  )

  for (const node of FIGMA_WORKSPACE_DESIGN_DOCUMENT_SNAPSHOT.nodes) {
    if (!node.id.startsWith('workspace')) {
      continue
    }

    for (const childId of node.children) {
      parents[childId] = node.id
    }
  }

  return parents
}
