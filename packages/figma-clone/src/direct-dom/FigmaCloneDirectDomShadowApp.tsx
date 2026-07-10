import {
  Eye,
  EyeOff,
  Maximize2,
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
import type { Viewport } from '../../../../src/canvas/core'
import {
  createDomProjection,
  type DomProjection,
} from '../../../../src/canvas/dom-projection'
import {
  ReactDesignRenderer,
  createReactDesignDefinitionRegistry,
  type ReactDesignIntrinsicTag,
} from '../../../../src/canvas/react-design-renderer'
import {
  createFigmaWorkspaceDesignDocument,
  type FigmaWorkspaceDesignNodeId,
} from '../design-document'
import {
  createFigmaWorkspaceReactDefinitions,
} from './FigmaWorkspaceReactDefinitions'
import '../FigmaCloneApp.css'

const FIGMA_WORKSPACE_INTRINSICS = [
  'article',
  'aside',
  'button',
  'div',
  'em',
  'h2',
  'header',
  'main',
  'nav',
  'p',
  'section',
  'span',
  'strong',
] as const satisfies readonly ReactDesignIntrinsicTag[]

const FIGMA_DIRECT_DOM_INITIAL_VIEWPORT = {
  scale: 0.7,
  x: 120,
  y: 80,
} satisfies Viewport

const FIGMA_DIRECT_DOM_FIT_PADDING = 48
const FIGMA_DIRECT_DOM_MIN_SCALE = 0.15
const FIGMA_DIRECT_DOM_MAX_SCALE = 3

type FigmaDirectDomFallbackMode = 'throw' | 'unknown' | null

type FigmaDirectDomViewportMemory = {
  read: () => Viewport
  write: (viewport: Viewport) => void
}

type FigmaDirectDomStageMemory = {
  read: () => HTMLElement | null
  write: (element: HTMLElement | null) => void
}

type FigmaDirectDomPanSession = {
  readonly clientX: number
  readonly clientY: number
  readonly pointerId: number
  readonly viewport: Viewport
}

export function FigmaCloneDirectDomShadowApp() {
  const panSessionRef = useRef<FigmaDirectDomPanSession | null>(null)
  const [fallbackMode] = useState(readFigmaDirectDomFallbackMode)
  const [document] = useState(() => createFigmaDirectDomDocument(
    fallbackMode,
  ))
  const documentSnapshot = useSyncExternalStore(
    document.subscribe,
    () => document.snapshot,
    () => document.snapshot,
  )
  const [viewportMemory] = useState(createFigmaDirectDomViewportMemory)
  const [stageMemory] = useState(createFigmaDirectDomStageMemory)
  const [viewport, setViewportState] = useState(viewportMemory.read)
  const setStageElement = useCallback((element: HTMLElement | null) => {
    stageMemory.write(element)
  }, [stageMemory])
  const [projection] = useState(() => createDomProjection({
    getStageElement: stageMemory.read,
    getViewport: viewportMemory.read,
  }))
  const projectionRevision = useSyncExternalStore(
    projection.subscribe,
    projection.revision,
    projection.revision,
  )
  useStrictModeSafeDomProjectionDisposal(projection)
  const [mounted, setMounted] = useState(true)
  const [panning, setPanning] = useState(false)
  const [focusedNodeId, setFocusedNodeId] =
    useState<FigmaWorkspaceDesignNodeId | null>(null)
  const registry = useMemo(() => createReactDesignDefinitionRegistry({
    definitions: createFigmaWorkspaceReactDefinitions({
      failDefinitionId: fallbackMode === 'throw'
        ? 'workspace-stat-card'
        : undefined,
    }),
    intrinsics: FIGMA_WORKSPACE_INTRINSICS,
  }), [fallbackMode])
  const root = document.read.node('workspacePage')
  const rootMeasurement = projection.measure('workspacePage')
  const registeredNodeCount = projection.registeredNodeIds().length
  const commitViewport = useCallback((nextViewport: Viewport) => {
    viewportMemory.write(nextViewport)
    setViewportState(nextViewport)
  }, [viewportMemory])
  const fitNode = useCallback((nodeId: FigmaWorkspaceDesignNodeId) => {
    const stage = stageMemory.read()
    const measurement = projection.measure(nodeId)

    if (!stage || !measurement) {
      return false
    }

    const stageRect = stage.getBoundingClientRect()
    const availableWidth = Math.max(
      1,
      stageRect.width - FIGMA_DIRECT_DOM_FIT_PADDING * 2,
    )
    const availableHeight = Math.max(
      1,
      stageRect.height - FIGMA_DIRECT_DOM_FIT_PADDING * 2,
    )
    const scale = clampFigmaDirectDomScale(Math.min(
      availableWidth / Math.max(1, measurement.worldBounds.w),
      availableHeight / Math.max(1, measurement.worldBounds.h),
    ))
    const contentWidth = measurement.worldBounds.w * scale
    const contentHeight = measurement.worldBounds.h * scale
    const targetX = FIGMA_DIRECT_DOM_FIT_PADDING +
      (availableWidth - contentWidth) / 2
    const targetY = FIGMA_DIRECT_DOM_FIT_PADDING +
      (availableHeight - contentHeight) / 2

    commitViewport({
      scale,
      x: targetX - measurement.worldBounds.x * scale,
      y: targetY - measurement.worldBounds.y * scale,
    })
    setFocusedNodeId(nodeId)
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

    const scale = clampFigmaDirectDomScale(
      viewportMemory.read().scale * factor,
    )

    commitViewport({
      scale,
      x: clientPoint.x - stageRect.left - worldPoint.x * scale,
      y: clientPoint.y - stageRect.top - worldPoint.y * scale,
    })
  }, [commitViewport, projection, stageMemory, viewportMemory])

  useEffect(() => {
    projection.refresh()
  }, [projection, viewport])

  useEffect(() => {
    if (
      !mounted ||
      focusedNodeId !== null ||
      !projection.registeredNodeIds().includes('workspacePage')
    ) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      fitNode('workspacePage')
    })

    return () => window.cancelAnimationFrame(frame)
  }, [fitNode, focusedNodeId, mounted, projection, projectionRevision])

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const explicitlyPans = event.button === 1
    const pansBackground = event.button === 0 &&
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
  const handlePointerMove = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
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
    const scale = clampFigmaDirectDomScale(
      viewportMemory.read().scale * Math.exp(-event.deltaY * 0.002),
    )

    commitViewport({
      scale,
      x: event.clientX - stageRect.left - worldPoint.x * scale,
      y: event.clientY - stageRect.top - worldPoint.y * scale,
    })
  }

  return (
    <main
      className="figma-clone figma-direct-dom"
      data-dom-projection-count={registeredNodeCount}
      data-figma-direct-dom="true"
      data-render-revision={projectionRevision}
      data-document-node-count={documentSnapshot.nodes.length}
      data-root-client-width={formatOptionalNumber(
        rootMeasurement?.clientBounds.w,
      )}
      data-root-world-width={formatOptionalNumber(
        rootMeasurement?.worldBounds.w,
      )}
      data-viewport-focus-node-id={focusedNodeId ?? undefined}
      data-viewport-scale={viewport.scale}
      data-viewport-x={viewport.x}
      data-viewport-y={viewport.y}
    >
      <section
        ref={setStageElement}
        aria-label="Direct DOM canvas"
        className="figma-direct-dom__stage"
        data-panning={panning ? 'true' : 'false'}
        role="region"
        onPointerCancel={finishPointerPan}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerPan}
        onWheel={handleWheel}
      >
        <div
          className="figma-direct-dom__world"
          data-direct-dom-world="true"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          }}
        >
          {mounted ? (
            <div
              className="figma-direct-dom__frame"
              style={{
                minHeight: root?.frame?.height,
                width: root?.frame?.width,
              }}
            >
              <ReactDesignRenderer
                projection={projection}
                read={document.read}
                registry={registry}
              />
            </div>
          ) : null}
        </div>
      </section>

      <div
        aria-label="Direct DOM viewport controls"
        className="figma-viewport-controls"
        role="toolbar"
      >
        <output className="figma-direct-dom__status">
          {registeredNodeCount} DOM · {Math.round(viewport.scale * 100)}%
        </output>
        <button
          aria-label={mounted ? 'Unmount page' : 'Mount page'}
          type="button"
          onClick={() => setMounted((current) => !current)}
        >
          {mounted
            ? <EyeOff aria-hidden="true" size={14} />
            : <Eye aria-hidden="true" size={14} />}
        </button>
        <button
          aria-label="Zoom out"
          type="button"
          onClick={() => zoomAtStageCenter(1 / 1.2)}
        >
          <ZoomOut aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Zoom in"
          type="button"
          onClick={() => zoomAtStageCenter(1.2)}
        >
          <ZoomIn aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Fit Revenue stat"
          type="button"
          onClick={() => fitNode('workspaceStatRevenue')}
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
        <button
          aria-label="Fit page"
          type="button"
          onClick={() => fitNode('workspacePage')}
        >
          <Maximize2 aria-hidden="true" size={14} />
        </button>
      </div>
    </main>
  )
}

function useStrictModeSafeDomProjectionDisposal(
  projection: DomProjection,
) {
  const lifetimeRef = useRef({ generation: 0, projection })

  useEffect(() => {
    const generation = lifetimeRef.current.generation + 1

    lifetimeRef.current = { generation, projection }

    return () => {
      queueMicrotask(() => {
        const current = lifetimeRef.current

        if (
          current.generation === generation ||
          current.projection !== projection
        ) {
          projection.dispose()
        }
      })
    }
  }, [projection])
}

function createFigmaDirectDomDocument(
  fallbackMode: FigmaDirectDomFallbackMode,
) {
  const document = createFigmaWorkspaceDesignDocument()

  if (fallbackMode === 'unknown') {
    const result = document.execute({
      label: 'Exercise unknown direct DOM definition',
      changes: [{
        type: 'update',
        nodeId: 'workspaceSearch',
        values: {
          definition: { kind: 'intrinsic', id: 'unknown-search' },
        },
      }],
    })

    if (!result.ok) {
      throw new Error(result.reason)
    }
  }

  return document
}

function readFigmaDirectDomFallbackMode(): FigmaDirectDomFallbackMode {
  if (typeof window === 'undefined') {
    return null
  }

  const mode = new URLSearchParams(window.location.search).get('fallback')

  return mode === 'throw' || mode === 'unknown' ? mode : null
}

function createFigmaDirectDomViewportMemory(): FigmaDirectDomViewportMemory {
  let viewport = { ...FIGMA_DIRECT_DOM_INITIAL_VIEWPORT }

  return {
    read: () => viewport,
    write: (nextViewport) => {
      viewport = { ...nextViewport }
    },
  }
}

function createFigmaDirectDomStageMemory(): FigmaDirectDomStageMemory {
  let element: HTMLElement | null = null

  return {
    read: () => element,
    write: (nextElement) => {
      element = nextElement
    },
  }
}

function clampFigmaDirectDomScale(scale: number) {
  return Math.min(
    FIGMA_DIRECT_DOM_MAX_SCALE,
    Math.max(FIGMA_DIRECT_DOM_MIN_SCALE, scale),
  )
}

function formatOptionalNumber(value: number | undefined) {
  return value === undefined ? undefined : value.toFixed(2)
}
