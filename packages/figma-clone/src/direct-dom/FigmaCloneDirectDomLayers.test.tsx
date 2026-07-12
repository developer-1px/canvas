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
} from '@interactive-os/canvas/react-design'
import { createDomProjection } from '@interactive-os/canvas/react-design'

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

  it('reorders same-parent siblings with Alt+Arrow and preserves history', async () => {
    const editor = createFixtureEditor()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<LayersHarness editor={editor} />))

    await act(async () => {
      getButton(container, 'Select layer Page').click()
    })
    const summaryButton = getButton(container, 'Select layer Summary')

    expect(summaryButton.getAttribute('aria-keyshortcuts'))
      .toBe('Alt+ArrowUp Alt+ArrowDown')
    summaryButton.focus()
    await act(async () => pressKey(summaryButton, 'ArrowUp', { altKey: true }))

    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'summary',
      'card',
      'activity',
    ])
    expect(editor.snapshot().selection.primaryNodeId).toBe('summary')
    expect(document.activeElement).toBe(summaryButton)
    expect(getTreeItem(container, 'Summary').getAttribute('aria-posinset'))
      .toBe('1')
    expect(container.querySelector('[role="status"]')?.textContent)
      .toBe('Summary moved to position 1 of 3.')
    const firstAnnouncement = container.querySelector('[role="status"] > span')
    expect(editor.snapshot().history).toEqual({ canRedo: false, canUndo: true })

    await act(async () => {
      editor.commands.execute({ type: 'history.undo' })
    })
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'card',
      'summary',
      'activity',
    ])
    expect(editor.snapshot().history).toEqual({ canRedo: true, canUndo: false })

    await act(async () => {
      editor.commands.execute({ type: 'history.redo' })
    })
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'summary',
      'card',
      'activity',
    ])
    expect(editor.snapshot().history).toEqual({ canRedo: false, canUndo: true })

    await act(async () => {
      editor.commands.execute({ type: 'history.undo' })
    })
    summaryButton.focus()
    await act(async () => pressKey(summaryButton, 'ArrowUp', { altKey: true }))

    const repeatedAnnouncement = container.querySelector(
      '[role="status"] > span',
    )

    expect(repeatedAnnouncement).not.toBe(firstAnnouncement)
    expect(repeatedAnnouncement?.textContent)
      .toBe('Summary moved to position 1 of 3.')
    expect(editor.snapshot().history).toEqual({ canRedo: false, canUndo: true })

    await act(async () => root.unmount())
    editor.dispose()
  })

  it('drags a sibling before another and exposes only transient feedback', async () => {
    const editor = createFixtureEditor()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<LayersHarness editor={editor} />))
    await act(async () => {
      getButton(container, 'Select layer Page').click()
    })

    const activityButton = getButton(container, 'Select layer Activity')
    const cardButton = getButton(container, 'Select layer Revenue hero')
    const dataTransfer = createDataTransfer()

    cardButton.getBoundingClientRect = () => ({
      bottom: 128,
      height: 28,
      left: 0,
      right: 200,
      top: 100,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    })

    expect(activityButton.draggable).toBe(true)
    activityButton.focus()
    await act(async () => {
      dispatchDrag(activityButton, 'dragstart', { dataTransfer })
    })
    await act(async () => {
      dispatchDrag(cardButton, 'dragover', {
        clientY: 104,
        dataTransfer,
      })
    })

    expect(cardButton.dataset.figmaLayerDropPlacement).toBe('before')

    await act(async () => {
      dispatchDrag(cardButton, 'dragleave', {
        dataTransfer,
        relatedTarget: cardButton.lastElementChild,
      })
    })
    expect(cardButton.dataset.figmaLayerDropPlacement).toBe('before')

    await act(async () => {
      dispatchDrag(cardButton, 'drop', { clientY: 104, dataTransfer })
    })

    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'activity',
      'card',
      'summary',
    ])
    expect(editor.snapshot().selection.primaryNodeId).toBe('activity')
    expect(document.activeElement).toBe(activityButton)
    expect(cardButton.dataset.figmaLayerDropPlacement).toBeUndefined()

    await act(async () => {
      editor.commands.execute({ type: 'history.undo' })
    })
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'card',
      'summary',
      'activity',
    ])

    activityButton.getBoundingClientRect = () => ({
      bottom: 128,
      height: 28,
      left: 0,
      right: 200,
      top: 100,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    })
    cardButton.focus()
    await act(async () => {
      dispatchDrag(cardButton, 'dragstart', { dataTransfer })
    })
    await act(async () => {
      dispatchDrag(activityButton, 'dragover', {
        clientY: 124,
        dataTransfer,
      })
    })

    expect(activityButton.dataset.figmaLayerDropPlacement).toBe('after')

    await act(async () => {
      dispatchDrag(activityButton, 'drop', {
        clientY: 124,
        dataTransfer,
      })
    })
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'summary',
      'activity',
      'card',
    ])
    expect(editor.snapshot().selection.primaryNodeId).toBe('card')
    expect(document.activeElement).toBe(cardButton)
    expect(container.querySelector('[role="status"]')?.textContent)
      .toBe('Revenue hero moved to position 3 of 3.')

    await act(async () => root.unmount())
    editor.dispose()
  })

  it('keeps roots, cross-parent drops, filtered rows, and boundaries fixed', async () => {
    const editor = createFixtureEditor()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<LayersHarness editor={editor} />))

    const pageButton = getButton(container, 'Select layer Page')
    await act(async () => pageButton.click())

    const cardButton = getButton(container, 'Select layer Revenue hero')

    expect(pageButton.draggable).toBe(false)
    cardButton.focus()
    let boundaryEvent: KeyboardEvent | null = null
    await act(async () => {
      boundaryEvent = pressKey(cardButton, 'ArrowUp', { altKey: true })
    })
    expect(boundaryEvent!.defaultPrevented).toBe(true)
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'card',
      'summary',
      'activity',
    ])
    expect(editor.snapshot().history.canUndo).toBe(false)

    const summaryButton = getButton(container, 'Select layer Summary')
    const labelButton = getButton(container, 'Select layer Amount')
    const dataTransfer = createDataTransfer()

    labelButton.getBoundingClientRect = () => ({
      bottom: 128,
      height: 28,
      left: 0,
      right: 200,
      top: 100,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    })
    await act(async () => {
      dispatchDrag(summaryButton, 'dragstart', { dataTransfer })
    })
    await act(async () => {
      dispatchDrag(labelButton, 'dragover', { clientY: 104, dataTransfer })
      dispatchDrag(labelButton, 'drop', { clientY: 104, dataTransfer })
    })
    expect(labelButton.dataset.figmaLayerDropPlacement).toBeUndefined()
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'card',
      'summary',
      'activity',
    ])
    expect(editor.snapshot().history.canUndo).toBe(false)

    await act(async () => {
      setInputValue(
        container.querySelector<HTMLInputElement>('[aria-label="Search layers"]')!,
        'summary',
      )
    })
    const filteredSummary = getButton(container, 'Select layer Summary')

    expect(filteredSummary.draggable).toBe(false)
    let filteredEvent: KeyboardEvent | null = null
    await act(async () => {
      filteredEvent = pressKey(
        filteredSummary,
        'ArrowDown',
        { altKey: true },
      )
    })
    expect(filteredEvent!.defaultPrevented).toBe(false)
    expect(editor.read.children('page').map((node) => node.id)).toEqual([
      'card',
      'summary',
      'activity',
    ])
    expect(editor.snapshot().history.canUndo).toBe(false)

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
        children: ['card', 'summary', 'activity'],
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
      createNode({ id: 'summary', label: 'Summary' }),
      createNode({ id: 'activity', label: 'Activity' }),
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

function pressKey(
  target: HTMLElement,
  key: string,
  init: Pick<KeyboardEventInit, 'altKey'> = { altKey: false },
) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...init,
  })

  target.dispatchEvent(event)
  return event
}

function createDataTransfer() {
  return {
    dropEffect: 'none',
    effectAllowed: 'none',
    getData: () => '',
    setData: () => undefined,
  }
}

function dispatchDrag(
  target: HTMLElement,
  type: 'dragleave' | 'dragover' | 'dragstart' | 'drop',
  {
    clientY = 0,
    dataTransfer,
    relatedTarget = null,
  }: {
    readonly clientY?: number
    readonly dataTransfer: ReturnType<typeof createDataTransfer>
    readonly relatedTarget?: Element | null
  },
) {
  const event = new Event(type, { bubbles: true, cancelable: true })

  Object.defineProperties(event, {
    clientY: { value: clientY },
    dataTransfer: { value: dataTransfer },
    relatedTarget: { value: relatedTarget },
  })
  target.dispatchEvent(event)
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}
