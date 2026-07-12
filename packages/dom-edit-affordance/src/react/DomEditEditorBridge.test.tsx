// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { createEditorEngine } from '@interactive-os/canvas/editor'
import {
  createDesignDocument,
  createDomProjection,
  type DesignDocumentSnapshot,
} from '@interactive-os/canvas/react-design'
import {
  DomEditEditorInspector,
  DomEditEditorOverlay,
} from '../react'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('DomEditEditor bridge', () => {
  let root: Root | null = null
  let container: HTMLDivElement | null = null

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount())
    }

    container?.remove()
    root = null
    container = null
  })

  it('edits a selected node through the EditorEngine command seam', async () => {
    const fixture = createEditorFixture()

    expect(fixture.editor.commands.execute({
      nodeId: 'root',
      type: 'selection.replace',
    })).toEqual({ changed: true, ok: true })

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <DomEditEditorInspector editor={fixture.editor} />,
    ))

    const gapInput = requireInput(container, 'Gap')

    await changeInput(gapInput, '24')

    expect(fixture.document.read.node('root')?.layout.gap).toBe(24)

    fixture.dispose()
  })

  it('measures and edits text through the selected projected node', async () => {
    const fixture = createEditorFixture()

    fixture.editor.commands.execute({
      nodeId: 'copy',
      type: 'selection.replace',
    })

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <>
        <DomEditEditorInspector editor={fixture.editor} />
        <DomEditEditorOverlay
          editor={fixture.editor}
          isCanvasPanActive={false}
          shellRef={{ current: fixture.stage }}
          viewport={{ scale: 1, x: 0, y: 0 }}
        />
      </>,
    ))
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })

    expect(container.querySelector('[aria-label="W 120 Fixed"]')).not.toBeNull()

    const textArea = requireTextArea(container, 'Text')

    await changeTextArea(textArea, 'World')

    expect(fixture.document.read.node('copy')?.text).toBe('World')

    await act(async () => {
      textArea.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Escape',
      }))
      textArea.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'z',
        metaKey: true,
      }))
    })

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('copy')
    expect(fixture.document.read.node('copy')?.text).toBe('World')

    fixture.dispose()
  })

  it('selects and measures projected nodes while containing composition keys', async () => {
    const fixture = createEditorFixture()

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <DomEditEditorOverlay
        editor={fixture.editor}
        isCanvasPanActive={false}
        shellRef={{ current: fixture.stage }}
        viewport={{ scale: 1, x: 0, y: 0 }}
      />,
    ))

    await click(fixture.rootElement)

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('root')

    await nextFrame()

    const selectedGuide = container.querySelector('.figma-guide-selected')

    expect(selectedGuide).toBeInstanceOf(HTMLElement)
    expect((selectedGuide as HTMLElement).style.left).toBe('20px')
    expect((selectedGuide as HTMLElement).style.top).toBe('30px')
    expect((selectedGuide as HTMLElement).style.width).toBe('240px')
    expect((selectedGuide as HTMLElement).style.height).toBe('120px')

    await keyDown('ArrowRight')

    expect(fixture.document.read.node('root')?.layout.x).toBe(0)
    expect(fixture.document.historyStatus().canUndo).toBe(false)

    await click(fixture.copyElement)

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('copy')

    await keyDown('Escape', { isComposing: true })

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('copy')

    await keyDown('Escape')

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('root')

    fixture.dispose()
  })

  it('keeps canvas selection while interacting with native editor controls', async () => {
    const fixture = createEditorFixture()
    const authoredControl = document.createElement('input')
    const textEditor = document.createElement('textarea')

    fixture.copyElement.append(authoredControl)
    textEditor.setAttribute('data-dom-edit-editor-control', '')
    fixture.stage.append(textEditor)
    fixture.editor.commands.execute({
      nodeId: 'root',
      type: 'selection.replace',
    })
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <DomEditEditorOverlay
        editor={fixture.editor}
        isCanvasPanActive={false}
        shellRef={{ current: fixture.stage }}
        viewport={{ scale: 1, x: 0, y: 0 }}
      />,
    ))
    await click(authoredControl)

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('copy')

    await act(async () => {
      fixture.editor.commands.execute({
        nodeId: 'root',
        type: 'selection.replace',
      })
    })
    await click(textEditor)

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBe('root')

    fixture.dispose()
  })

  it('lets a product own canvas selection while retaining editor overlays', async () => {
    const fixture = createEditorFixture()

    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => root?.render(
      <DomEditEditorOverlay
        canvasSelection={false}
        editor={fixture.editor}
        isCanvasPanActive={false}
        shellRef={{ current: fixture.stage }}
        viewport={{ scale: 1, x: 0, y: 0 }}
      />,
    ))
    await click(fixture.copyElement)

    expect(fixture.editor.snapshot().selection.primaryNodeId).toBeNull()

    fixture.dispose()
  })
})

function createEditorFixture() {
  const designDocument = createDesignDocument(EDITOR_FIXTURE_SNAPSHOT)
  const stage = document.createElement('div')
  const rootElement = document.createElement('div')
  const copyElement = document.createElement('span')

  stage.append(rootElement)
  rootElement.append(copyElement)
  document.body.append(stage)

  Object.defineProperty(stage, 'getBoundingClientRect', {
    value: () => createRect({ height: 500, left: 0, top: 0, width: 800 }),
  })
  Object.defineProperty(rootElement, 'getBoundingClientRect', {
    value: () => createRect({ height: 120, left: 20, top: 30, width: 240 }),
  })
  Object.defineProperty(copyElement, 'getBoundingClientRect', {
    value: () => createRect({ height: 24, left: 36, top: 46, width: 120 }),
  })

  const projection = createDomProjection({
    getStageElement: () => stage,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
  const unregisterRoot = projection.register('root', rootElement)
  const unregisterCopy = projection.register('copy', copyElement)
  const editor = createEditorEngine({
    document: designDocument,
    projection,
  })

  return {
    copyElement,
    dispose() {
      editor.dispose()
      unregisterCopy()
      unregisterRoot()
      projection.dispose()
      stage.remove()
    },
    document: designDocument,
    editor,
    rootElement,
    stage,
  }
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      button: 0,
    }))
  })
}

async function keyDown(
  key: string,
  options: { readonly isComposing?: boolean } = {},
) {
  await act(async () => {
    const event = new KeyboardEvent('keydown', { bubbles: true, key })

    if (options.isComposing) {
      Object.defineProperty(event, 'isComposing', { value: true })
    }

    window.dispatchEvent(event)
  })
}

async function nextFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

async function changeInput(input: HTMLInputElement, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set

    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

async function changeTextArea(input: HTMLTextAreaElement, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set

    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function requireInput(container: HTMLElement, label: string) {
  const input = container.querySelector(`input[aria-label="${label}"]`)

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Missing input: ${label}`)
  }

  return input
}

function requireTextArea(container: HTMLElement, label: string) {
  const input = container.querySelector(`textarea[aria-label="${label}"]`)

  if (!(input instanceof HTMLTextAreaElement)) {
    throw new Error(`Missing textarea: ${label}`)
  }

  return input
}

function createRect({
  height,
  left,
  top,
  width,
}: {
  height: number
  left: number
  top: number
  width: number
}): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => undefined,
  }
}

const EDITOR_FIXTURE_SNAPSHOT = {
  nodes: [
    createNode({
      children: ['copy'],
      id: 'root',
      label: 'Root',
      props: { display: 'flex' },
    }),
    createNode({
      id: 'copy',
      label: 'Copy',
      text: 'Hello',
    }),
  ],
  roots: ['root'],
  schemaVersion: 1,
} satisfies DesignDocumentSnapshot

function createNode({
  children = [],
  id,
  label,
  props = {},
  text = null,
}: {
  children?: readonly string[]
  id: string
  label: string
  props?: Record<string, string>
  text?: string | null
}) {
  return {
    children,
    component: null,
    definition: { id: 'div', kind: 'intrinsic' as const },
    frame: null,
    id,
    label,
    layout: {
      align: 'start',
      alignSelf: 'auto',
      direction: 'row',
      distribution: 'start',
      gap: 8,
      h: 120,
      heightMode: 'fixed',
      margin: 0,
      order: 0,
      padding: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      w: 240,
      widthMode: 'fixed',
      x: 0,
      y: 0,
    },
    props,
    style: {
      opacity: 100,
      radius: 0,
      rotation: 0,
    },
    text,
  }
}
