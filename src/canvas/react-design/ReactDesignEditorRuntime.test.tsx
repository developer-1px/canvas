// @vitest-environment jsdom

import { StrictMode, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDesignDocument } from '../design-document'
import {
  createReactDesignDefinitionRegistry,
  ReactDesignRenderer,
} from '../react-design-renderer'
import {
  useReactDesignEditorRuntime,
  type ReactDesignEditorRuntime,
} from './ReactDesignEditorRuntime'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('ReactDesignEditorRuntime', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('composes the canonical editor modules and owns finite viewport updates', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: {
          fitPadding: 24,
          initial: { scale: 0.5, x: 20, y: 30 },
          maxScale: 3,
          minScale: 0.25,
        },
      })

      runtime = current

      return (
        <div
          ref={current.stage.attach}
          data-scale={current.viewport.value.scale}
          data-viewport-x={current.viewport.value.x}
          data-viewport-y={current.viewport.value.y}
        >
          <ReactDesignRenderer
            projection={current.projection}
            read={current.editor.read}
            registry={current.registry}
          />
        </div>
      )
    }

    await act(async () => root.render(<RuntimeHarness />))

    expect(runtime).not.toBeNull()
    expect(runtime!.document.read.node('page')?.label).toBe('Page')
    expect(runtime!.editor.read.node('page')?.id).toBe('page')
    expect(runtime!.projection.element('page')).toBe(
      container.querySelector('[data-design-node-id="page"]'),
    )
    expect(runtime!.stage.read()).toBe(container.firstElementChild)
    expect(runtime!.snapshot.selection.primaryNodeId).toBeNull()
    expect(runtime!.viewport.read()).toEqual({ scale: 0.5, x: 20, y: 30 })

    await act(async () => runtime!.viewport.set({
      scale: 10,
      x: 80,
      y: 90,
    }))

    expect(runtime!.viewport.value).toEqual({ scale: 3, x: 80, y: 90 })
    expect(runtime!.viewport.read()).toEqual({ scale: 3, x: 80, y: 90 })

    await act(async () => runtime!.viewport.panBy({ x: -12, y: 8 }))

    expect(runtime!.viewport.value).toEqual({ scale: 3, x: 68, y: 98 })

    await act(async () => runtime!.viewport.reset())

    expect(runtime!.viewport.value).toEqual({ scale: 0.5, x: 20, y: 30 })

    await act(async () => root.unmount())

    expect(runtime!.stage.read()).toBeNull()
  })

  it('zooms around client points and fits registered nodes inside the stage', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: {
          fitPadding: 24,
          initial: { scale: 0.5, x: 20, y: 30 },
          maxScale: 3,
          minScale: 0.25,
        },
      })

      runtime = current

      return (
        <div ref={current.stage.attach} data-runtime-stage>
          <ReactDesignRenderer
            projection={current.projection}
            read={current.editor.read}
            registry={current.registry}
          />
        </div>
      )
    }

    await act(async () => root.render(<RuntimeHarness />))

    const stage = container.querySelector<HTMLElement>('[data-runtime-stage]')
    const page = container.querySelector<HTMLElement>(
      '[data-design-node-id="page"]',
    )

    expect(stage).not.toBeNull()
    expect(page).not.toBeNull()
    stage!.getBoundingClientRect = () => createDomRect({
      height: 600,
      left: 100,
      top: 50,
      width: 800,
    })
    page!.getBoundingClientRect = () => createDomRect({
      height: 100,
      left: 170,
      top: 120,
      width: 200,
    })

    let didZoom = false

    await act(async () => {
      didZoom = runtime!.viewport.zoomAtClientPoint(
        { x: 500, y: 350 },
        2,
      )
    })

    expect(didZoom).toBe(true)
    expect(runtime!.viewport.value).toEqual({ scale: 1, x: -360, y: -240 })

    await act(async () => runtime!.viewport.reset())

    let didZoomAtCenter = false

    await act(async () => {
      didZoomAtCenter = runtime!.viewport.zoomAtStageCenter(2)
    })

    expect(didZoomAtCenter).toBe(true)
    expect(runtime!.viewport.value).toEqual({ scale: 1, x: -360, y: -240 })

    await act(async () => runtime!.viewport.reset())

    let didFit = false

    await act(async () => {
      didFit = runtime!.viewport.fitNodeIds(['page'])
    })

    expect(didFit).toBe(true)
    expect(runtime!.viewport.value.scale).toBeCloseTo(1.88)
    expect(runtime!.viewport.value.x).toBeCloseTo(-164)
    expect(runtime!.viewport.value.y).toBeCloseTo(-38.4)

    await act(async () => root.unmount())
  })

  it('survives the StrictMode effect replay and disposes after the real unmount', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: {
          initial: { scale: 1, x: 0, y: 0 },
        },
      })

      runtime = current

      return (
        <div ref={current.stage.attach}>
          <ReactDesignRenderer
            projection={current.projection}
            read={current.editor.read}
            registry={current.registry}
          />
        </div>
      )
    }

    await act(async () => root.render(
      <StrictMode>
        <RuntimeHarness />
      </StrictMode>,
    ))

    let selectionResult

    await act(async () => {
      selectionResult = runtime!.editor.commands.execute({
        type: 'selection.replace',
        nodeId: 'page',
      })
    })

    expect(selectionResult).toEqual({ changed: true, ok: true })
    expect(runtime!.projection.element('page')).not.toBeNull()

    await act(async () => root.unmount())
    await Promise.resolve()

    expect(runtime!.editor.commands.execute({
      type: 'selection.replace',
      nodeId: null,
    })).toEqual({
      code: 'disposed',
      ok: false,
      reason: 'EditorEngine is disposed',
    })
  })
})

function createRuntimeDocument() {
  return createDesignDocument({
    schemaVersion: 1,
    roots: ['page'],
    nodes: [{
      id: 'page',
      label: 'Page',
      definition: { id: 'section', kind: 'intrinsic' },
      children: [],
      props: {},
      text: 'Runtime',
      layout: {},
      style: {},
      frame: null,
      component: null,
    }],
  })
}

function createRuntimeRegistry() {
  return createReactDesignDefinitionRegistry({
    intrinsics: ['section'],
  })
}

function stubResizeObserver() {
  class FakeResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
}

function createDomRect({
  height,
  left,
  top,
  width,
}: {
  readonly height: number
  readonly left: number
  readonly top: number
  readonly width: number
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
    toJSON: () => ({}),
  }
}
