// @vitest-environment jsdom

import { act, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createEditorEngine,
  type EditorEngine,
} from '@interactive-os/canvas/editor'
import {
  createDesignDocument,
  type DesignDocumentSnapshot,
  type DesignNode,
} from '../../../../src/canvas/design-document'
import { createDomProjection } from '../../../../src/canvas/dom-projection'

import { FigmaCloneDirectDomLayers } from './FigmaCloneDirectDomLayers'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('FigmaCloneDirectDomLayers', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('projects canonical widget and page roots into the Figma layer tree', async () => {
    const editor = createFixtureEditor()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<LayersHarness editor={editor} />))

    const widget = getTreeItem(container, 'React widget')
    const section = getTreeItem(container, 'Page section')
    const page = getTreeItem(container, 'Page')
    const sectionButton = getButton(container, 'Select Page section')
    const pageButton = getButton(container, 'Select layer Page')

    expect(widget.getAttribute('aria-level')).toBe('1')
    expect(widget.getAttribute('aria-posinset')).toBe('1')
    expect(section.getAttribute('aria-level')).toBe('1')
    expect(section.getAttribute('aria-posinset')).toBe('2')
    expect(section.getAttribute('aria-setsize')).toBe('2')
    expect(section.getAttribute('aria-expanded')).toBe('true')
    expect(section.getAttribute('aria-selected')).toBe('true')
    expect(page.getAttribute('aria-level')).toBe('2')
    expect(page.getAttribute('aria-expanded')).toBe('false')
    expect(sectionButton.dataset.figmaLayerKind).toBe('section')
    expect(sectionButton.dataset.figmaLayerSectionRootId).toBe('page')
    expect(pageButton.dataset.figmaLayerKind).toBe('node')
    expect(pageButton.dataset.figmaLayerNodeId).toBe('page')
    expect(pageButton.dataset.figmaLayerRootId).toBe('page')

    await act(async () => pageButton.click())

    expect(editor.snapshot().selection.primaryNodeId).toBe('page')
    expect(getTreeItem(container, 'Page').getAttribute('aria-expanded'))
      .toBe('true')
    expect(getTreeItem(container, 'Page').getAttribute('aria-selected'))
      .toBe('true')
    expect(getTreeItem(container, 'Page section').getAttribute('aria-selected'))
      .toBe('false')

    await act(async () => root.unmount())
    editor.dispose()
  })

  it('reflects an external descendant selection in the tree', async () => {
    const editor = createFixtureEditor()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<LayersHarness editor={editor} />))
    expect(getTreeItem(container, 'Page section').getAttribute('aria-selected'))
      .toBe('true')

    await act(async () => {
      editor.commands.execute({ type: 'selection.replace', nodeId: 'card' })
    })

    expect(getTreeItem(container, 'Revenue hero').getAttribute('aria-selected'))
      .toBe('true')
    expect(getTreeItem(container, 'Page section').getAttribute('aria-selected'))
      .toBe('false')
    expect(getButton(container, 'Select layer Revenue hero').tabIndex).toBe(0)

    await act(async () => root.unmount())
    editor.dispose()
  })
})

function LayersHarness({ editor }: { readonly editor: EditorEngine }) {
  const snapshot = useSyncExternalStore(
    editor.subscribe,
    editor.snapshot,
    editor.snapshot,
  )

  return <FigmaCloneDirectDomLayers editor={editor} snapshot={snapshot} />
}

function createFixtureEditor() {
  const document = createDesignDocument({
    schemaVersion: 1,
    roots: ['widget', 'page'],
    nodes: [
      createNode({
        id: 'widget',
        label: 'React widget',
        definition: { kind: 'widget', id: 'fixture-widget' },
      }),
      createNode({
        id: 'page',
        label: 'Page',
        children: ['card'],
      }),
      createNode({
        id: 'card',
        label: 'Revenue hero',
        children: ['label'],
        definition: { kind: 'component', id: 'hero-card' },
        component: {
          definitionId: 'hero-card',
          instanceId: 'revenue',
          slotId: 'root',
        },
      }),
      createNode({ id: 'label', label: 'Amount', text: '$42k' }),
    ],
  } satisfies DesignDocumentSnapshot)
  const projection = createDomProjection({
    getStageElement: () => null,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
  const editor = createEditorEngine({ document, projection })

  editor.commands.execute({ type: 'selection.replace', nodeId: 'page' })
  return editor
}

function createNode({
  children = [],
  component = null,
  definition = { kind: 'intrinsic', id: 'div' },
  id,
  label,
  text = null,
}: Pick<DesignNode, 'id' | 'label'> & Partial<Pick<
  DesignNode,
  'children' | 'component' | 'definition' | 'text'
>>): DesignNode {
  return {
    id,
    label,
    children,
    component,
    definition,
    frame: null,
    layout: {},
    props: {},
    style: {},
    text,
  }
}

function getTreeItem(container: HTMLElement, label: string) {
  const item = container.querySelector<HTMLElement>(
    `[role="treeitem"][aria-label="${label}"]`,
  )

  if (!item) {
    throw new Error(`Missing tree item: ${label}`)
  }

  return item
}

function getButton(container: HTMLElement, label: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`,
  )

  if (!button) {
    throw new Error(`Missing button: ${label}`)
  }

  return button
}
