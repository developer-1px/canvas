// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createEditorEngine } from '@interactive-os/canvas/editor'
import { createDesignDocument } from '../../../../src/canvas/design-document'
import { createDomProjection } from '../../../../src/canvas/dom-projection'
import { DomEditEditorOverlay } from '../react'

vi.mock('react-moveable', async () => {
  const React = await import('react')

  type MockMoveableProps = {
    readonly className?: string
    readonly draggable?: boolean
    readonly onDrag: (event: {
      beforeTranslate: number[]
      datas: Record<string, unknown>
      inputEvent: { shiftKey: boolean }
    }) => void
    readonly onDragEnd: (event: {
      inputEvent: { type: string }
    }) => void
    readonly onDragStart: (event: {
      datas: Record<string, unknown>
      set(value: number[]): void
    }) => void
    readonly resizable?: boolean
  }

  const MockMoveable = React.forwardRef<
    { updateRect(): void },
    MockMoveableProps
  >(function MockMoveable(props, ref) {
    const datas = React.useRef<Record<string, unknown>>({})

    React.useImperativeHandle(ref, () => ({ updateRect() {} }))

    return (
      <div
        className={props.className}
        data-draggable={String(props.draggable)}
        data-resizable={String(props.resizable)}
      >
        <button
          aria-label="Test drag start"
          type="button"
          onClick={() => props.onDragStart({
            datas: datas.current,
            set: () => undefined,
          })}
        />
        <button
          aria-label="Test drag move"
          type="button"
          onClick={() => props.onDrag({
            beforeTranslate: [20, 10],
            datas: datas.current,
            inputEvent: { shiftKey: false },
          })}
        />
        <button
          aria-label="Test drag end"
          type="button"
          onClick={() => props.onDragEnd({
            inputEvent: { type: 'pointerup' },
          })}
        />
      </div>
    )
  })

  return { default: MockMoveable }
})

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('DomEditEditor direct manipulation', () => {
  const cleanups: Array<() => void | Promise<void>> = []

  afterEach(async () => {
    while (cleanups.length > 0) {
      await cleanups.pop()?.()
    }

    vi.restoreAllMocks()
  })

  it('previews without history, cancels cleanly, and commits once', async () => {
    const animationFrames: FrameRequestCallback[] = []

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const fixture = createPreviewFixture()
    const container = document.createElement('div')
    const reactRoot = createRoot(container)

    document.body.append(container)
    cleanups.push(async () => {
      await act(async () => reactRoot.unmount())
      container.remove()
      fixture.dispose()
    })

    fixture.editor.commands.execute({
      nodeId: 'floating',
      type: 'selection.replace',
    })

    await act(async () => reactRoot.render(
      <DomEditEditorOverlay
        affordanceState={{ mode: 'hover-property', property: 'geometry' }}
        draggable
        editor={fixture.editor}
        isCanvasPanActive={false}
        shellRef={{ current: fixture.stage }}
        viewport={{ scale: 1, x: 0, y: 0 }}
        resizable={false}
      />,
    ))
    await flushAnimationFrames(animationFrames)

    const initialSerialized = fixture.document.serialize()

    const moveable = container.querySelector('.figma-dom-moveable')

    expect(moveable?.getAttribute('data-draggable')).toBe('true')
    expect(moveable?.getAttribute('data-resizable')).toBe('false')

    await clickButton(container, 'Test drag start')
    await clickButton(container, 'Test drag move')

    expect(fixture.editor.read.node('floating')?.layout.x).toBe(20)
    expect(fixture.document.read.node('floating')?.layout.x).toBe(0)
    expect(fixture.document.serialize()).toBe(initialSerialized)
    expect(fixture.editor.snapshot().history.canUndo).toBe(false)

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Escape',
        metaKey: true,
      }))
    })
    await clickButton(container, 'Test drag end')

    expect(fixture.editor.read.node('floating')?.layout.x).toBe(0)
    expect(fixture.document.serialize()).toBe(initialSerialized)
    expect(fixture.editor.snapshot().history.canUndo).toBe(false)

    await clickButton(container, 'Test drag start')
    await clickButton(container, 'Test drag move')
    await clickButton(container, 'Test drag end')

    expect(fixture.document.read.node('floating')?.layout).toMatchObject({
      x: 20,
      y: 10,
    })
    expect(fixture.editor.snapshot().history.canUndo).toBe(true)

    let undoResult

    await act(async () => {
      undoResult = fixture.editor.commands.execute({ type: 'history.undo' })
    })

    expect(undoResult).toEqual({ changed: true, ok: true })
    expect(fixture.document.read.node('floating')?.layout).toMatchObject({
      x: 0,
      y: 0,
    })
    expect(fixture.editor.snapshot().history.canUndo).toBe(false)
  })
})

function createPreviewFixture() {
  const designDocument = createDesignDocument({
    nodes: [{
      children: [],
      component: null,
      definition: { id: 'div', kind: 'intrinsic' },
      frame: null,
      id: 'floating',
      label: 'Floating',
      layout: {
        align: 'start',
        alignSelf: 'auto',
        direction: 'row',
        distribution: 'start',
        gap: 0,
        h: 80,
        heightMode: 'fixed',
        margin: 0,
        order: 0,
        padding: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        w: 120,
        widthMode: 'fixed',
        x: 0,
        y: 0,
      },
      props: { position: 'absolute' },
      style: { opacity: 100, radius: 0, rotation: 0 },
      text: null,
    }],
    roots: ['floating'],
    schemaVersion: 1,
  })
  const stage = document.createElement('div')
  const element = document.createElement('div')

  stage.append(element)
  document.body.append(stage)
  Object.defineProperty(stage, 'getBoundingClientRect', {
    value: () => createRect(0, 0, 800, 500),
  })
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => createRect(40, 60, 120, 80),
  })

  const projection = createDomProjection({
    getStageElement: () => stage,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
  const unregister = projection.register('floating', element)
  const editor = createEditorEngine({
    document: designDocument,
    projection,
  })

  return {
    dispose() {
      editor.dispose()
      unregister()
      projection.dispose()
      stage.remove()
    },
    document: designDocument,
    editor,
    stage,
  }
}

async function clickButton(container: HTMLElement, name: string) {
  const button = [...container.querySelectorAll('button')].find(
    (candidate) => candidate.getAttribute('aria-label') === name,
  )

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Missing button: ${name}`)
  }

  await act(async () => button.click())
}

async function flushAnimationFrames(
  frames: FrameRequestCallback[],
  rounds = 4,
) {
  for (let round = 0; round < rounds; round += 1) {
    const pending = frames.splice(0)

    await act(async () => {
      for (const callback of pending) {
        callback(round * 16)
      }
    })
  }
}

function createRect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
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
