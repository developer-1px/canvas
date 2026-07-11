import {
  Inspect,
  Maximize2,
  MousePointer2,
  Ruler,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import {
  createEditorEngine,
  type EditorEngine,
} from '@interactive-os/canvas/editor'
import {
  DomEditEditorOverlay,
  type DomEditAffordanceState,
} from '@interactive-os/dom-edit-affordance/react'
import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasToolbarRovingFocus,
} from '../../../src/canvas/app'
import type {
  Bounds,
  Viewport,
} from '../../../src/canvas/core'
import type {
  DesignDocument,
  DesignNodeId,
} from '../../../src/canvas/design-document'
import {
  createDomProjection,
  type DomProjection,
} from '../../../src/canvas/dom-projection'
import {
  ReactDesignRenderer,
  createReactDesignDefinitionRegistry,
} from '../../../src/canvas/react-design-renderer'
import {
  createFigmaDesignDocument,
} from './design-document'
import { FigmaCloneDirectDomLayers } from './direct-dom/FigmaCloneDirectDomLayers'
import { getFigmaCloneFrameGuides } from './direct-dom/FigmaCloneFrameGuides'
import { FigmaCloneInspector } from './direct-dom/FigmaCloneInspector'
import {
  FIGMA_REACT_INTRINSICS,
  createFigmaReactDefinitions,
} from './direct-dom/FigmaWorkspaceReactDefinitions'
import './FigmaCloneApp.css'

const FIGMA_INITIAL_VIEWPORT = {
  scale: 0.38,
  x: 300,
  y: 72,
} satisfies Viewport

const FIGMA_FIT_PADDING = 48
const FIGMA_MIN_SCALE = 0.15
const FIGMA_MAX_SCALE = 3

type FigmaViewportMemory = {
  read: () => Viewport
  write: (viewport: Viewport) => void
}

type FigmaStageMemory = {
  read: () => HTMLElement | null
  write: (element: HTMLElement | null) => void
}

type FigmaPanSession = {
  readonly clientX: number
  readonly clientY: number
  readonly pointerId: number
  readonly viewport: Viewport
}

export function FigmaCloneApp() {
  const panSessionRef = useRef<FigmaPanSession | null>(null)
  const stageRef = useRef<HTMLElement | null>(null)
  const lastFittedRootIdRef = useRef<DesignNodeId | null>(null)
  const [document] = useState(createFigmaDesignDocument)
  const [viewportMemory] = useState(createFigmaViewportMemory)
  const [stageMemory] = useState(createFigmaStageMemory)
  const [viewport, setViewportState] = useState(viewportMemory.read)
  const [projection] = useState(() => createDomProjection({
    getStageElement: stageMemory.read,
    getViewport: viewportMemory.read,
  }))
  const [editor] = useState(() => createFigmaEditor(document, projection))
  const editorSnapshot = useSyncExternalStore(
    editor.subscribe,
    editor.snapshot,
    editor.snapshot,
  )
  const projectionRevision = editorSnapshot.revision
  const [affordanceState, setAffordanceState] =
    useState<DomEditAffordanceState>({ mode: 'idle' })
  const [panning, setPanning] = useState(false)
  const [temporaryPan, setTemporaryPan] = useState(false)
  const [viewportFocusNodeId, setViewportFocusNodeId] =
    useState<DesignNodeId | null>(null)
  const toolToolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()
  const viewportToolbarRovingFocus =
    useCanvasToolbarRovingFocus<HTMLDivElement>()
  const registry = useMemo(() => createReactDesignDefinitionRegistry({
    definitions: createFigmaReactDefinitions(),
    intrinsics: FIGMA_REACT_INTRINSICS,
  }), [])
  const selectedNodeId = editorSnapshot.selection.primaryNodeId
  const selectedRootId = getFigmaRootId(editor, selectedNodeId)
  const initialRootId = editor.read.roots().find((root) =>
    root.definition.kind !== 'widget')?.id ?? null
  const selectedRoot = selectedRootId ? editor.read.node(selectedRootId) : null
  const selectedNode = selectedNodeId ? editor.read.node(selectedNodeId) : null
  const editableSelectedNodeId = selectedNode?.definition.kind === 'widget'
    ? null
    : selectedNodeId
  const frameGuides = selectedRoot?.frame &&
    selectedRoot.definition.kind !== 'widget'
    ? getFigmaCloneFrameGuides({
        frame: selectedRoot.frame,
        rootId: selectedRoot.id,
      })
    : null
  const registeredNodeCount = projection.registeredNodeIds().length
  const workspaceMeasurement = projection.measure('workspacePage')
  const floatingNote = document.read.node('workspaceFloatingNote')
  const heroActions = document.read.node('workspaceHeroActions')

  useStrictModeSafeEditorRuntimeDisposal(editor, projection)
  useFigmaDomSelectionMirror({
    primaryNodeId: editableSelectedNodeId,
    projection,
    revision: projectionRevision,
  })

  const setStageElement = useCallback((element: HTMLElement | null) => {
    stageRef.current = element
    stageMemory.write(element)
  }, [stageMemory])
  const commitViewport = useCallback((nextViewport: Viewport) => {
    viewportMemory.write(nextViewport)
    setViewportState(nextViewport)
  }, [viewportMemory])
  const fitNodeIds = useCallback((nodeIds: readonly DesignNodeId[]) => {
    const stage = stageMemory.read()
    const bounds = getFigmaMeasuredBounds(projection, nodeIds)

    if (!stage || !bounds) {
      return false
    }

    const stageRect = stage.getBoundingClientRect()
    const availableWidth = Math.max(
      1,
      stageRect.width - FIGMA_FIT_PADDING * 2,
    )
    const availableHeight = Math.max(
      1,
      stageRect.height - FIGMA_FIT_PADDING * 2,
    )
    const scale = clampFigmaScale(Math.min(
      availableWidth / Math.max(1, bounds.w),
      availableHeight / Math.max(1, bounds.h),
    ))
    const contentWidth = bounds.w * scale
    const contentHeight = bounds.h * scale
    const targetX = FIGMA_FIT_PADDING + (availableWidth - contentWidth) / 2
    const targetY = FIGMA_FIT_PADDING + (availableHeight - contentHeight) / 2

    commitViewport({
      scale,
      x: targetX - bounds.x * scale,
      y: targetY - bounds.y * scale,
    })
    setViewportFocusNodeId(nodeIds.length === 1 ? nodeIds[0] : null)
    return true
  }, [commitViewport, projection, stageMemory])
  const zoomAtStageCenter = useCallback((factor: number) => {
    const stage = stageMemory.read()

    if (!stage) {
      return
    }

    const stageRect = stage.getBoundingClientRect()
    const clientPoint = {
      x: stageRect.left + stageRect.width / 2,
      y: stageRect.top + stageRect.height / 2,
    }
    const worldPoint = projection.clientToWorld(clientPoint)

    if (!worldPoint) {
      return
    }

    const scale = clampFigmaScale(viewportMemory.read().scale * factor)

    commitViewport({
      scale,
      x: clientPoint.x - stageRect.left - worldPoint.x * scale,
      y: clientPoint.y - stageRect.top - worldPoint.y * scale,
    })
  }, [commitViewport, projection, stageMemory, viewportMemory])
  const selectTool = useCallback(() => {
    setTemporaryPan(false)
    setAffordanceState({ mode: 'idle' })
  }, [])
  const changeAffordanceState = useCallback((state: DomEditAffordanceState) => {
    setAffordanceState(state)

    if (state.mode !== 'idle') {
      setTemporaryPan(false)
    }
  }, [])

  useEffect(() => {
    projection.refresh()
  }, [projection, viewport])

  useEffect(() => {
    const rootId = selectedRootId ?? (
      lastFittedRootIdRef.current === null ? initialRootId : null
    )

    if (
      !rootId ||
      lastFittedRootIdRef.current === rootId
    ) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      if (fitNodeIds([rootId])) {
        lastFittedRootIdRef.current = rootId
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [fitNodeIds, initialRootId, projectionRevision, selectedRootId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.isComposing ||
        isFigmaTextEntryControl(event.target)
      ) {
        return
      }

      if (event.key === ' ') {
        if (isFigmaSpaceActivationControl(event.target)) {
          return
        }

        event.preventDefault()
        setTemporaryPan(true)
        return
      }

      if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'h') {
        event.preventDefault()
        setTemporaryPan(true)
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setTemporaryPan(false)
      }

      if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'v') {
        setTemporaryPan(false)
      }
    }
    const stopTemporaryPan = () => setTemporaryPan(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', stopTemporaryPan)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', stopTemporaryPan)
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const explicitlyPans = event.button === 1 ||
      (event.button === 0 && temporaryPan)
    const pansBackground = event.button === 0 &&
      !isFigmaEditorControl(event.target) &&
      projection.hitPath(event.target).length === 0

    if (!explicitlyPans && !pansBackground) {
      return
    }

    event.preventDefault()
    panSessionRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      viewport: viewportMemory.read(),
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPanning(true)
  }
  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const session = panSessionRef.current

    if (!session || session.pointerId !== event.pointerId) {
      return
    }

    commitViewport({
      ...session.viewport,
      x: session.viewport.x + event.clientX - session.clientX,
      y: session.viewport.y + event.clientY - session.clientY,
    })
  }
  const finishPointerPan = (event: ReactPointerEvent<HTMLElement>) => {
    if (panSessionRef.current?.pointerId !== event.pointerId) {
      return
    }

    panSessionRef.current = null
    setPanning(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()

    if (!event.ctrlKey && !event.metaKey) {
      const current = viewportMemory.read()

      commitViewport({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      })
      return
    }

    const stage = stageMemory.read()
    const worldPoint = projection.clientToWorld({
      x: event.clientX,
      y: event.clientY,
    })

    if (!stage || !worldPoint) {
      return
    }

    const stageRect = stage.getBoundingClientRect()
    const scale = clampFigmaScale(
      viewportMemory.read().scale * Math.exp(-event.deltaY * 0.002),
    )

    commitViewport({
      scale,
      x: event.clientX - stageRect.left - worldPoint.x * scale,
      y: event.clientY - stageRect.top - worldPoint.y * scale,
    })
  }
  const canvasPanActive = temporaryPan || panning

  return (
    <main
      className="figma-clone figma-direct-dom"
      data-affordance-mode={affordanceState.mode}
      data-document-node-count={document.snapshot.nodes.length}
      data-dom-projection-count={registeredNodeCount}
      data-editor-revision={editorSnapshot.revision}
      data-floating-note-x={readFiniteNumber(floatingNote?.layout.x)}
      data-history-can-redo={editorSnapshot.history.canRedo}
      data-history-can-undo={editorSnapshot.history.canUndo}
      data-hero-actions-gap={readFiniteNumber(heroActions?.layout.gap)}
      data-hero-actions-padding-right={readFiniteNumber(
        heroActions?.layout.paddingRight,
      )}
      data-preview-node-id={editorSnapshot.preview?.nodeId ?? undefined}
      data-render-revision={projectionRevision}
      data-root-client-width={formatOptionalNumber(
        workspaceMeasurement?.clientBounds.w,
      )}
      data-root-world-width={formatOptionalNumber(
        workspaceMeasurement?.worldBounds.w,
      )}
      data-selected-node-id={selectedNodeId ?? undefined}
      data-viewport-focus-node-id={viewportFocusNodeId ?? undefined}
      data-viewport-scale={viewport.scale}
      data-viewport-x={viewport.x}
      data-viewport-y={viewport.y}
    >
      <FigmaCloneDirectDomLayers
        editor={editor}
        snapshot={editorSnapshot}
      />

      <section className="figma-canvas-region" aria-label="Canvas">
        <div
          {...toolToolbarRovingFocus}
          aria-label="Tools"
          className="figma-canvas-toolbar"
          role="toolbar"
        >
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label="Select tool"
            aria-pressed={
              !temporaryPan &&
              affordanceState.mode !== 'measure' &&
              affordanceState.mode !== 'xray'
            }
            type="button"
            onClick={selectTool}
          >
            <MousePointer2 aria-hidden="true" size={14} />
          </button>
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label="Measure tool"
            aria-pressed={affordanceState.mode === 'measure'}
            title="Measure"
            type="button"
            onClick={() => {
              setTemporaryPan(false)
              setAffordanceState((current) => current.mode === 'measure'
                ? { mode: 'idle' }
                : { mode: 'measure' })
            }}
          >
            <Ruler aria-hidden="true" size={14} />
          </button>
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            aria-label="Toggle box model X-ray"
            aria-pressed={affordanceState.mode === 'xray'}
            title="X-ray"
            type="button"
            onClick={() => {
              setTemporaryPan(false)
              setAffordanceState((current) => current.mode === 'xray'
                ? { mode: 'idle' }
                : { mode: 'xray' })
            }}
          >
            <Inspect aria-hidden="true" size={14} />
          </button>
        </div>

        <div
          ref={setStageElement}
          className="figma-direct-dom__stage"
          data-mode={canvasPanActive ? 'pan' : 'select'}
          data-panning={panning ? 'true' : 'false'}
          tabIndex={-1}
          onPointerCancel={finishPointerPan}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerPan}
          onWheel={handleWheel}
        >
          <div
            className="figma-direct-dom__world"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            }}
          >
            <ReactDesignRenderer
              projection={projection}
              read={editor.read}
              registry={registry}
            />
          </div>
          <DomEditEditorOverlay
            affordanceState={affordanceState}
            editor={editor}
            frameGuides={frameGuides}
            isCanvasPanActive={canvasPanActive}
            selectedNodeId={editableSelectedNodeId}
            shellRef={stageRef}
            viewport={viewport}
            onAffordanceStateChange={changeAffordanceState}
          />
        </div>
      </section>

      <aside className="figma-inspector" aria-label="CSS Inspector">
        <header>
          <h1>CSS</h1>
        </header>
        <div className="figma-inspector-body">
          <FigmaCloneInspector editor={editor} snapshot={editorSnapshot} />
        </div>
      </aside>

      <div
        {...viewportToolbarRovingFocus}
        aria-label="Viewport"
        className="figma-viewport-controls"
        role="toolbar"
      >
        <span>{Math.round(viewport.scale * 100)}%</span>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Zoom out"
          type="button"
          onClick={() => zoomAtStageCenter(1 / 1.2)}
        >
          <ZoomOut aria-hidden="true" size={14} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Zoom in"
          type="button"
          onClick={() => zoomAtStageCenter(1.2)}
        >
          <ZoomIn aria-hidden="true" size={14} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Fit selection"
          disabled={!selectedNodeId}
          type="button"
          onClick={() => {
            if (selectedNodeId) {
              fitNodeIds([selectedNodeId])
            }
          }}
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
        <button
          {...CANVAS_TOOLBAR_ITEM_PROPS}
          aria-label="Fit all"
          type="button"
          onClick={() => fitNodeIds(editor.read.roots().map((root) => root.id))}
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
      </div>
    </main>
  )
}

function createFigmaEditor(
  document: DesignDocument,
  projection: DomProjection,
) {
  return createEditorEngine({ document, projection })
}

function getFigmaRootId(
  editor: EditorEngine,
  nodeId: DesignNodeId | null,
) {
  return nodeId ? editor.read.ancestry(nodeId)[0]?.id ?? null : null
}

function getFigmaMeasuredBounds(
  projection: DomProjection,
  nodeIds: readonly DesignNodeId[],
): Bounds | null {
  const bounds = nodeIds.flatMap((nodeId) => {
    const measurement = projection.measure(nodeId)

    return measurement ? [measurement.worldBounds] : []
  })

  if (bounds.length === 0) {
    return null
  }

  const minX = Math.min(...bounds.map((item) => item.x))
  const minY = Math.min(...bounds.map((item) => item.y))
  const maxX = Math.max(...bounds.map((item) => item.x + item.w))
  const maxY = Math.max(...bounds.map((item) => item.y + item.h))

  return {
    h: maxY - minY,
    w: maxX - minX,
    x: minX,
    y: minY,
  }
}

function useFigmaDomSelectionMirror({
  primaryNodeId,
  projection,
  revision,
}: {
  readonly primaryNodeId: DesignNodeId | null
  readonly projection: DomProjection
  readonly revision: number
}) {
  useEffect(() => {
    const registeredNodeIds = projection.registeredNodeIds()

    for (const nodeId of registeredNodeIds) {
      const element = projection.element(nodeId)

      if (nodeId === primaryNodeId) {
        element?.setAttribute('data-selected', 'true')
      } else {
        element?.removeAttribute('data-selected')
      }
    }

    return () => {
      for (const nodeId of registeredNodeIds) {
        projection.element(nodeId)?.removeAttribute('data-selected')
      }
    }
  }, [primaryNodeId, projection, revision])
}

function useStrictModeSafeEditorRuntimeDisposal(
  editor: EditorEngine,
  projection: DomProjection,
) {
  const lifetimeRef = useRef({ editor, generation: 0, projection })

  useEffect(() => {
    const generation = lifetimeRef.current.generation + 1

    lifetimeRef.current = { editor, generation, projection }

    return () => {
      queueMicrotask(() => {
        const current = lifetimeRef.current

        if (
          current.generation === generation ||
          current.editor !== editor ||
          current.projection !== projection
        ) {
          editor.dispose()
          projection.dispose()
        }
      })
    }
  }, [editor, projection])
}

function createFigmaViewportMemory(): FigmaViewportMemory {
  let viewport = { ...FIGMA_INITIAL_VIEWPORT }

  return {
    read: () => viewport,
    write: (nextViewport) => {
      viewport = { ...nextViewport }
    },
  }
}

function createFigmaStageMemory(): FigmaStageMemory {
  let element: HTMLElement | null = null

  return {
    read: () => element,
    write: (nextElement) => {
      element = nextElement
    },
  }
}

function clampFigmaScale(scale: number) {
  return Math.min(FIGMA_MAX_SCALE, Math.max(FIGMA_MIN_SCALE, scale))
}

function formatOptionalNumber(value: number | undefined) {
  return value === undefined ? undefined : value.toFixed(2)
}

function readFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined
}

function isFigmaEditorControl(target: EventTarget | null) {
  return target instanceof Element &&
    target.closest('.figma-selection-layer') !== null
}

function isFigmaTextEntryControl(target: EventTarget | null) {
  return target instanceof Element && target.closest(
    'input, textarea, select, [contenteditable="true"]',
  ) !== null
}

function isFigmaSpaceActivationControl(target: EventTarget | null) {
  return target instanceof Element && target.closest(
    [
      'a[href]',
      'button',
      'summary',
      '[role="button"]',
      '[role="checkbox"]',
      '[role="combobox"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="radio"]',
      '[role="slider"]',
      '[role="spinbutton"]',
      '[role="switch"]',
      '[role="tab"]',
      '[role="treeitem"]',
    ].join(', '),
  ) !== null
}
