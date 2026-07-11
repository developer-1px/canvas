import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import {
  MAX_SCALE,
  MIN_SCALE,
  type Bounds,
  type Point,
  type Viewport,
} from '../core'
import type {
  DesignDocument,
  DesignNodeId,
} from '../design-document'
import {
  createDomProjection,
  type DomProjection,
} from '../dom-projection'
import {
  createEditorEngine,
  type EditorEngine,
  type EditorEngineSnapshot,
} from '../editor-engine'
import type { ReactDesignDefinitionRegistry } from '../react-design-renderer'

export type ReactDesignEditorViewportOptions = {
  readonly fitPadding?: number
  readonly initial: Viewport
  readonly maxScale?: number
  readonly minScale?: number
}

export type UseReactDesignEditorRuntimeOptions = {
  readonly createDocument: () => DesignDocument
  readonly createRegistry: () => ReactDesignDefinitionRegistry
  readonly viewport: ReactDesignEditorViewportOptions
}

export type ReactDesignEditorRuntime = {
  readonly document: DesignDocument
  readonly editor: EditorEngine
  readonly projection: DomProjection
  readonly registry: ReactDesignDefinitionRegistry
  readonly snapshot: EditorEngineSnapshot
  readonly stage: {
    attach(element: HTMLElement | null): void
    read(): HTMLElement | null
  }
  readonly viewport: {
    readonly value: Viewport
    fitNodeIds(nodeIds: readonly DesignNodeId[]): boolean
    panBy(delta: Point): void
    read(): Viewport
    reset(): void
    set(viewport: Viewport): void
    zoomAtClientPoint(point: Point, factor: number): boolean
    zoomAtStageCenter(factor: number): boolean
  }
}

type ReactDesignEditorRuntimeState = {
  readonly document: DesignDocument
  readonly editor: EditorEngine
  readonly projection: DomProjection
  readonly registry: ReactDesignDefinitionRegistry
  readonly stage: {
    read(): HTMLElement | null
    write(element: HTMLElement | null): void
  }
  readonly viewport: {
    readonly fitPadding: number
    readonly initial: Viewport
    readonly maxScale: number
    readonly minScale: number
    read(): Viewport
    write(viewport: Viewport): void
  }
}

export function useReactDesignEditorRuntime(
  options: UseReactDesignEditorRuntimeOptions,
): ReactDesignEditorRuntime {
  const [runtime] = useState(() => createRuntimeState(options))
  const [viewportValue, setViewportValue] = useState(runtime.viewport.read)
  const snapshot = useSyncExternalStore(
    runtime.editor.subscribe,
    runtime.editor.snapshot,
    runtime.editor.snapshot,
  )
  const lifetimeRef = useRef({ generation: 0, runtime })

  const setViewport = useCallback((viewport: Viewport) => {
    const nextViewport = normalizeViewport(viewport, runtime.viewport)

    runtime.viewport.write(nextViewport)
    setViewportValue(nextViewport)
  }, [runtime])
  const panBy = useCallback((delta: Point) => {
    const current = runtime.viewport.read()

    setViewport({
      ...current,
      x: current.x + finiteOrZero(delta.x),
      y: current.y + finiteOrZero(delta.y),
    })
  }, [runtime, setViewport])
  const resetViewport = useCallback(() => {
    setViewport(runtime.viewport.initial)
  }, [runtime, setViewport])
  const zoomAtClientPoint = useCallback((point: Point, factor: number) => {
    const stage = runtime.stage.read()

    if (!stage || !isPositiveFinite(factor)) {
      return false
    }

    const worldPoint = runtime.projection.clientToWorld(point)

    if (!worldPoint) {
      return false
    }

    const stageRect = stage.getBoundingClientRect()
    const scale = clampViewportScale(
      runtime.viewport.read().scale * factor,
      runtime.viewport,
    )

    setViewport({
      scale,
      x: point.x - stageRect.left - worldPoint.x * scale,
      y: point.y - stageRect.top - worldPoint.y * scale,
    })
    return true
  }, [runtime, setViewport])
  const zoomAtStageCenter = useCallback((factor: number) => {
    const stage = runtime.stage.read()

    if (!stage) {
      return false
    }

    const stageRect = stage.getBoundingClientRect()

    return zoomAtClientPoint({
      x: stageRect.left + stageRect.width / 2,
      y: stageRect.top + stageRect.height / 2,
    }, factor)
  }, [runtime, zoomAtClientPoint])
  const fitNodeIds = useCallback((nodeIds: readonly DesignNodeId[]) => {
    const stage = runtime.stage.read()
    const bounds = getMeasuredBounds(runtime.projection, nodeIds)

    if (!stage || !bounds) {
      return false
    }

    const stageRect = stage.getBoundingClientRect()
    const availableWidth = Math.max(
      1,
      stageRect.width - runtime.viewport.fitPadding * 2,
    )
    const availableHeight = Math.max(
      1,
      stageRect.height - runtime.viewport.fitPadding * 2,
    )
    const scale = clampViewportScale(Math.min(
      availableWidth / Math.max(1, bounds.w),
      availableHeight / Math.max(1, bounds.h),
    ), runtime.viewport)
    const targetX = runtime.viewport.fitPadding +
      (availableWidth - bounds.w * scale) / 2
    const targetY = runtime.viewport.fitPadding +
      (availableHeight - bounds.h * scale) / 2

    setViewport({
      scale,
      x: targetX - bounds.x * scale,
      y: targetY - bounds.y * scale,
    })
    return true
  }, [runtime, setViewport])
  const attachStage = useCallback((element: HTMLElement | null) => {
    runtime.stage.write(element)
  }, [runtime])

  useEffect(() => {
    runtime.projection.refresh()
  }, [runtime, viewportValue])

  useEffect(() => {
    const generation = lifetimeRef.current.generation + 1

    lifetimeRef.current = { generation, runtime }

    return () => {
      queueMicrotask(() => {
        const current = lifetimeRef.current

        if (
          current.generation === generation ||
          current.runtime !== runtime
        ) {
          runtime.editor.dispose()
          runtime.projection.dispose()
        }
      })
    }
  }, [runtime])

  return {
    document: runtime.document,
    editor: runtime.editor,
    projection: runtime.projection,
    registry: runtime.registry,
    snapshot,
    stage: {
      attach: attachStage,
      read: runtime.stage.read,
    },
    viewport: {
      value: viewportValue,
      fitNodeIds,
      panBy,
      read: runtime.viewport.read,
      reset: resetViewport,
      set: setViewport,
      zoomAtClientPoint,
      zoomAtStageCenter,
    },
  }
}

function createRuntimeState({
  createDocument,
  createRegistry,
  viewport: viewportOptions,
}: UseReactDesignEditorRuntimeOptions): ReactDesignEditorRuntimeState {
  const viewport = createViewportMemory(viewportOptions)
  const stage = createStageMemory()
  const document = createDocument()
  const registry = createRegistry()
  const projection = createDomProjection({
    getStageElement: stage.read,
    getViewport: viewport.read,
  })
  const editor = createEditorEngine({ document, projection })

  return {
    document,
    editor,
    projection,
    registry,
    stage,
    viewport,
  }
}

function createViewportMemory(
  options: ReactDesignEditorViewportOptions,
): ReactDesignEditorRuntimeState['viewport'] {
  const minScale = readPositiveFinite(options.minScale, MIN_SCALE)
  const maxScale = readPositiveFinite(options.maxScale, MAX_SCALE)

  if (minScale > maxScale) {
    throw new Error('React design editor viewport minScale exceeds maxScale')
  }

  const limits = { minScale, maxScale }
  const initial = normalizeViewport(options.initial, limits)
  let value = initial

  return {
    fitPadding: Math.max(0, finiteOrZero(options.fitPadding ?? 0)),
    initial,
    maxScale,
    minScale,
    read: () => value,
    write: (viewport) => {
      value = viewport
    },
  }
}

function createStageMemory(): ReactDesignEditorRuntimeState['stage'] {
  let element: HTMLElement | null = null

  return {
    read: () => element,
    write: (nextElement) => {
      element = nextElement
    },
  }
}

function normalizeViewport(
  viewport: Viewport,
  limits: Pick<
    ReactDesignEditorRuntimeState['viewport'],
    'maxScale' | 'minScale'
  >,
): Viewport {
  return {
    scale: clampViewportScale(viewport.scale, limits),
    x: finiteOrZero(viewport.x),
    y: finiteOrZero(viewport.y),
  }
}

function getMeasuredBounds(
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

function clampViewportScale(
  scale: number,
  limits: Pick<
    ReactDesignEditorRuntimeState['viewport'],
    'maxScale' | 'minScale'
  >,
) {
  return Math.min(
    limits.maxScale,
    Math.max(limits.minScale, finiteOr(scale, limits.minScale)),
  )
}

function readPositiveFinite(value: number | undefined, fallback: number) {
  return isPositiveFinite(value)
    ? value
    : fallback
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function finiteOrZero(value: number) {
  return finiteOr(value, 0)
}
