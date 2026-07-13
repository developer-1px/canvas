// @vitest-environment jsdom

import { StrictMode, act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createDesignDocument,
  getDesignDocumentPatchPort,
} from '../design-document'
import {
  createReactDesignDefinitionRegistry,
  ReactDesignRenderer,
} from '../react-design-renderer'
import { ReactDesignEditorRenderer } from './ReactDesignEditorRenderer'
import {
  getReactDesignEditorExternalChangeHost,
  type ReactDesignEditorExternalChangeHost,
} from './ReactDesignEditorExternalChanges'
import { createReactDesignTextSelection } from './ReactDesignTextSelection'
import {
  useReactDesignEditorRuntime,
  type ReactDesignEditorRuntime,
} from './ReactDesignEditorRuntime'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

type ExternalChangeResult = ReturnType<
  ReactDesignEditorExternalChangeHost['runReady']
>

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
          <ReactDesignEditorRenderer runtime={current} />
        </div>
      )
    }

    await act(async () => root.render(
      <StrictMode>
        <RuntimeHarness />
      </StrictMode>,
    ))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)
    const onReady = vi.fn()
    const stopReady = externalChanges.subscribeReady(onReady)

    let selectionResult

    await act(async () => {
      selectionResult = runtime!.editor.commands.execute({
        type: 'selection.replace',
        nodeId: 'page',
      })
    })

    expect(selectionResult).toEqual({ changed: true, ok: true })
    expect(runtime!.projection.element('page')).not.toBeNull()
    expect(onReady).toHaveBeenCalledTimes(1)

    onReady.mockClear()
    act(() => {
      runtime!.editor.commands.execute({
        type: 'selection.replace',
        nodeId: null,
      })
    })
    act(() => root.unmount())
    await Promise.resolve()

    expect(onReady).not.toHaveBeenCalled()
    expect(externalChanges.runReady({
      id: 'after-unmount',
      apply: vi.fn(),
    })).toMatchObject({ code: 'host_not_ready', ok: false })
    expect(getReactDesignEditorExternalChangeHost(runtime!)).toBe(externalChanges)
    expect(runtime!.editor.commands.execute({
      type: 'selection.replace',
      nodeId: null,
    })).toEqual({
      code: 'disposed',
      ok: false,
      reason: 'EditorEngine is disposed',
    })
    stopReady()
  })

  it('keeps the existing runtime usable for a document without patch coordination', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: () => ({ ...createRuntimeDocument() }),
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })

      runtime = current
      return (
        <ReactDesignRenderer
          projection={current.projection}
          read={current.editor.read}
          registry={current.registry}
        />
      )
    }

    await act(async () => root.render(<RuntimeHarness />))

    expect(runtime!.editor.read.node('page')?.text).toBe('Runtime')
    expect(container.textContent).toBe('Runtime')

    await act(async () => root.unmount())
  })

  it('revokes DOM readiness when its renderer unmounts before the runtime', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null
    let setRendererVisible: ((visible: boolean) => void) | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })
      const [rendererVisible, setVisible] = useState(true)

      runtime = current
      setRendererVisible = setVisible
      return rendererVisible
        ? <ReactDesignEditorRenderer runtime={current} />
        : null
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)

    expect(externalChanges.runReady({
      id: 'while-mounted',
      apply: vi.fn(),
    })).toEqual({ ok: true })

    await act(async () => setRendererVisible?.(false))

    const applyAfterUnmount = vi.fn()

    expect(externalChanges.runReady({
      id: 'after-renderer-unmount',
      apply: applyAfterUnmount,
    })).toMatchObject({ code: 'host_not_ready', ok: false })
    expect(applyAfterUnmount).not.toHaveBeenCalled()

    await act(async () => root.unmount())
  })

  it('fails closed for the runtime lifetime after canonical renderers overlap', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null
    let setRendererKeys: ((keys: string[]) => void) | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })
      const [rendererKeys, setKeys] = useState(['first'])

      runtime = current
      setRendererKeys = setKeys
      return rendererKeys.map((key) => (
        <ReactDesignEditorRenderer key={key} runtime={current} />
      ))
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)

    expect(externalChanges.runReady({
      id: 'one-renderer',
      apply: vi.fn(),
    })).toEqual({ ok: true })

    await act(async () => setRendererKeys?.(['first', 'second']))

    expect(externalChanges.runReady({
      id: 'overlapping-renderers',
      apply: vi.fn(),
    })).toMatchObject({ code: 'host_not_ready', ok: false })

    await act(async () => setRendererKeys?.(['first']))

    expect(externalChanges.runReady({
      id: 'remaining-overlapped-renderer',
      apply: vi.fn(),
    })).toMatchObject({ code: 'host_not_ready', ok: false })

    await act(async () => setRendererKeys?.([]))
    await act(async () => setRendererKeys?.(['fresh']))

    expect(externalChanges.runReady({
      id: 'fresh-canonical-renderer',
      apply: vi.fn(),
    })).toMatchObject({ code: 'host_not_ready', ok: false })

    await act(async () => root.unmount())
  })

  it('defers listeners subscribed during the current ready notification', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })

      runtime = current
      return <ReactDesignEditorRenderer runtime={current} />
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)
    const lateListener = vi.fn()
    let stopLateListener: () => void = () => undefined
    let subscribedLateListener = false
    const firstListener = vi.fn(() => {
      if (!subscribedLateListener) {
        subscribedLateListener = true
        stopLateListener = externalChanges.subscribeReady(lateListener)
      }
    })
    const stopFirstListener = externalChanges.subscribeReady(firstListener)

    await act(async () => {
      runtime!.editor.commands.execute({
        type: 'selection.replace',
        nodeId: 'page',
      })
    })

    expect(firstListener).toHaveBeenCalledTimes(1)
    expect(lateListener).not.toHaveBeenCalled()

    await act(async () => {
      runtime!.editor.commands.execute({
        type: 'selection.replace',
        nodeId: null,
      })
    })

    expect(firstListener).toHaveBeenCalledTimes(2)
    expect(lateListener).toHaveBeenCalledTimes(1)

    stopFirstListener()
    stopLateListener()
    await act(async () => root.unmount())
  })

  it('runs a ready external change only after the local canonical DOM commits', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })

      runtime = current
      return <ReactDesignEditorRenderer runtime={current} />
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)

    const apply = vi.fn(() => {
      expect(container.textContent).toBe('Local')
      expect(getDesignDocumentPatchPort(runtime!.document).commit([
        { op: 'replace', path: '/nodes/0/text', value: 'Remote' },
      ])).toEqual({ ok: true })
    })
    let session: ReturnType<
      ReactDesignEditorRuntime['editor']['commands']['beginPreview']
    > = null

    await act(async () => {
      session = runtime!.editor.commands.beginPreview({
        label: 'Edit page text',
        nodeId: 'page',
      })
      expect(session?.update([{ target: 'text', value: 'Local' }]))
        .toEqual({ changed: true, ok: true })
      expect(externalChanges.runReady({ id: 'remote', apply }))
        .toMatchObject({ code: 'host_not_ready', ok: false })
    })

    let beforeRenderCommit: ExternalChangeResult | null = null

    const retries: ExternalChangeResult[] = []
    let stopRetry: () => void = () => undefined

    stopRetry = externalChanges.subscribeReady(() => {
      const result = externalChanges.runReady({ id: 'remote', apply })

      retries.push(result)
      if (result.ok) {
        stopRetry()
      }
    })

    await act(async () => {
      expect(session?.commit()).toEqual({ changed: true, ok: true })
      beforeRenderCommit = externalChanges.runReady({
        id: 'remote',
        apply,
      })
      expect(beforeRenderCommit).toMatchObject({
        code: 'host_not_ready',
        ok: false,
      })
      expect(apply).not.toHaveBeenCalled()
    })

    expect(apply).toHaveBeenCalledTimes(1)
    expect(retries).toEqual([{ ok: true }])
    expect(container.textContent).toBe('Remote')

    await act(async () => root.unmount())
  })

  it('retries ready work after a canceled preview DOM commit', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })

      runtime = current
      return <ReactDesignEditorRenderer runtime={current} />
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)

    let session: ReturnType<
      ReactDesignEditorRuntime['editor']['commands']['beginPreview']
    > = null

    await act(async () => {
      session = runtime!.editor.commands.beginPreview({
        label: 'Edit page text',
        nodeId: 'page',
      })
      expect(session?.update([{ target: 'text', value: 'Preview' }]))
        .toEqual({ changed: true, ok: true })
    })

    const apply = vi.fn()
    let beforeRenderCommit: ExternalChangeResult | null = null
    const results: ExternalChangeResult[] = []
    const stopRetry = externalChanges.subscribeReady(() => {
      results.push(externalChanges.runReady({ id: 'remote', apply }))
    })

    await act(async () => {
      expect(session?.cancel()).toEqual({ changed: true, ok: true })
      beforeRenderCommit = externalChanges.runReady({
        id: 'remote-before-cancel-render',
        apply,
      })
      expect(beforeRenderCommit).toMatchObject({
        code: 'host_not_ready',
        ok: false,
      })
      expect(apply).not.toHaveBeenCalled()
    })

    expect(results).toEqual([{ ok: true }])
    expect(apply).toHaveBeenCalledTimes(1)
    expect(container.textContent).toBe('Runtime')

    stopRetry()
    await act(async () => root.unmount())
  })

  it('restores selection only after the external snapshot remount commits', async () => {
    stubResizeObserver()
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)
    let runtime: ReactDesignEditorRuntime | null = null
    let editorElement: HTMLTextAreaElement | null = null
    const setEditorElement = (element: HTMLTextAreaElement | null) => {
      editorElement = element
    }

    function RuntimeHarness() {
      const current = useReactDesignEditorRuntime({
        createDocument: createRuntimeDocument,
        createRegistry: createRuntimeRegistry,
        viewport: { initial: { scale: 1, x: 0, y: 0 } },
      })

      runtime = current
      const text = current.document.snapshot.nodes[0]?.text ?? ''

      return (
        <>
          <ReactDesignEditorRenderer runtime={current} />
          <textarea
            key={text}
            ref={setEditorElement}
            defaultValue={text}
          />
        </>
      )
    }

    await act(async () => root.render(<RuntimeHarness />))

    const externalChanges = getReactDesignEditorExternalChangeHost(runtime!)

    const selection = createReactDesignTextSelection({ document })
    const ownership = selection.claim({
      nodeId: 'page',
      readElement: () => editorElement,
    })
    const initialElement = requireTextArea(editorElement)

    initialElement.focus()
    initialElement.setSelectionRange(1, 5, 'forward')
    const bookmark = ownership.capture()
    const restores: boolean[] = []
    const stopRestore = externalChanges.subscribeReady(() => {
      if (bookmark) {
        restores.push(ownership.restore(bookmark))
      }
    })

    await act(async () => {
      expect(externalChanges.runReady({
        id: 'remote',
        apply() {
          expect(getDesignDocumentPatchPort(runtime!.document).commit([
            { op: 'replace', path: '/nodes/0/text', value: 'Remote text' },
          ])).toEqual({ ok: true })
        },
      })).toEqual({ ok: true })

      expect(editorElement).toBe(initialElement)
    })

    expect(editorElement).not.toBe(initialElement)
    expect(restores).toEqual([true])
    expect(document.activeElement).toBe(editorElement)
    const restoredElement = requireTextArea(editorElement)

    expect(restoredElement.selectionStart).toBe(1)
    expect(restoredElement.selectionEnd).toBe(5)

    stopRestore()
    ownership.release()
    selection.dispose()
    await act(async () => root.unmount())
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

function requireTextArea(element: HTMLTextAreaElement | null) {
  if (!element) {
    throw new Error('Expected textarea')
  }

  return element
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
