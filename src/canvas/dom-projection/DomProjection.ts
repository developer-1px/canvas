import type {
  Bounds,
  Point,
  Viewport,
} from '../core'
import type { DesignNodeId } from '../design-document'

export type CreateDomProjectionOptions = {
  readonly getStageElement: () => HTMLElement | null
  readonly getViewport: () => Viewport
}

export type DomProjectionMeasurement = {
  readonly nodeId: DesignNodeId
  readonly clientBounds: Bounds
  readonly worldBounds: Bounds
}

export type DomProjection = {
  register(nodeId: DesignNodeId, element: HTMLElement): () => void
  registeredNodeIds(): readonly DesignNodeId[]
  revision(): number
  subscribe(listener: () => void): () => void
  measure(nodeId: DesignNodeId): DomProjectionMeasurement | null
  hitPath(target: EventTarget | null): readonly DesignNodeId[]
  clientToWorld(point: Point): Point | null
  worldToClient(point: Point): Point | null
  focus(nodeId: DesignNodeId, options?: FocusOptions): boolean
  refresh(): void
  dispose(): void
}

export function createDomProjection(
  options: CreateDomProjectionOptions,
): DomProjection {
  const registrations = new Map<DesignNodeId, { element: HTMLElement }>()
  let nodeIdsByElement = new WeakMap<object, DesignNodeId>()
  const listeners = new Set<() => void>()
  let currentRevision = 0
  let disposed = false
  let resizeObserver: ResizeObserver | null = null
  let resizeObserverInitialized = false

  function publishChange() {
    currentRevision += 1

    for (const listener of listeners) {
      try {
        listener()
      } catch {
        // One consumer cannot interrupt invalidation for the remaining views.
      }
    }
  }

  function getResizeObserver() {
    if (!resizeObserverInitialized) {
      resizeObserverInitialized = true
      resizeObserver = createResizeObserver(() => {
        if (!disposed) {
          publishChange()
        }
      })
    }

    return resizeObserver
  }

  return {
    clientToWorld(point: Point) {
      if (disposed) {
        return null
      }

      const context = readProjectionContext(options)

      return context ? projectClientPointToWorld(point, context) : null
    },
    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      safelyDisconnect(resizeObserver)
      resizeObserver = null
      registrations.clear()
      nodeIdsByElement = new WeakMap<object, DesignNodeId>()
      publishChange()
      listeners.clear()
    },
    focus(nodeId: DesignNodeId, focusOptions?: FocusOptions) {
      if (disposed) {
        return false
      }

      const element = registrations.get(nodeId)?.element

      if (!element) {
        return false
      }

      element.focus(focusOptions)
      return true
    },
    measure(nodeId: DesignNodeId): DomProjectionMeasurement | null {
      if (disposed) {
        return null
      }

      const element = registrations.get(nodeId)?.element

      if (!element) {
        return null
      }

      const context = readProjectionContext(options)

      if (!context) {
        return null
      }

      const rect = element.getBoundingClientRect()
      const clientBounds = toBounds(rect)
      const worldPoint = projectClientPointToWorld(clientBounds, context)

      return {
        nodeId,
        clientBounds,
        worldBounds: {
          ...worldPoint,
          h: clientBounds.h / context.viewport.scale,
          w: clientBounds.w / context.viewport.scale,
        },
      }
    },
    register(nodeId: DesignNodeId, element: HTMLElement) {
      if (disposed) {
        throw new Error('DomProjection is disposed')
      }

      const observer = getResizeObserver()
      const previousRegistration = registrations.get(nodeId)
      const previousNodeId = nodeIdsByElement.get(element)

      if (previousRegistration) {
        safelyUnobserve(observer, previousRegistration.element)
        nodeIdsByElement.delete(previousRegistration.element)
      }

      if (previousNodeId && previousNodeId !== nodeId) {
        registrations.delete(previousNodeId)
      }

      const registration = { element }

      registrations.set(nodeId, registration)
      nodeIdsByElement.set(element, nodeId)
      safelyObserve(observer, element)
      publishChange()
      let active = true

      return () => {
        if (!active) {
          return
        }

        active = false

        if (registrations.get(nodeId) !== registration) {
          return
        }

        registrations.delete(nodeId)
        safelyUnobserve(observer, element)

        if (nodeIdsByElement.get(element) === nodeId) {
          nodeIdsByElement.delete(element)
        }

        publishChange()
      }
    },
    refresh() {
      if (!disposed) {
        publishChange()
      }
    },
    registeredNodeIds() {
      return [...registrations.keys()].sort()
    },
    hitPath(target: EventTarget | null) {
      if (disposed) {
        return []
      }

      const path: DesignNodeId[] = []
      const seen = new Set<DesignNodeId>()
      let current: object | null = target

      while (current) {
        const nodeId = nodeIdsByElement.get(current)

        if (nodeId && !seen.has(nodeId)) {
          seen.add(nodeId)
          path.push(nodeId)
        }

        current = readParentElement(current)
      }

      return path
    },
    revision() {
      return currentRevision
    },
    subscribe(listener: () => void) {
      if (disposed) {
        return () => undefined
      }

      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    worldToClient(point: Point) {
      if (disposed) {
        return null
      }

      const context = readProjectionContext(options)

      return context ? projectWorldPointToClient(point, context) : null
    },
  }
}

type ProjectionContext = {
  readonly stageRect: DOMRect
  readonly viewport: Viewport
}

function readProjectionContext(
  options: CreateDomProjectionOptions,
): ProjectionContext | null {
  const stage = options.getStageElement()
  const viewport = options.getViewport()

  if (
    !stage ||
    !Number.isFinite(viewport.scale) ||
    viewport.scale <= 0 ||
    !Number.isFinite(viewport.x) ||
    !Number.isFinite(viewport.y)
  ) {
    return null
  }

  const stageRect = stage.getBoundingClientRect()

  if (!Number.isFinite(stageRect.left) || !Number.isFinite(stageRect.top)) {
    return null
  }

  return { stageRect, viewport }
}

function projectClientPointToWorld(
  point: Point,
  { stageRect, viewport }: ProjectionContext,
): Point {
  return {
    x: (point.x - stageRect.left - viewport.x) / viewport.scale,
    y: (point.y - stageRect.top - viewport.y) / viewport.scale,
  }
}

function projectWorldPointToClient(
  point: Point,
  { stageRect, viewport }: ProjectionContext,
): Point {
  return {
    x: point.x * viewport.scale + viewport.x + stageRect.left,
    y: point.y * viewport.scale + viewport.y + stageRect.top,
  }
}

function toBounds(rect: DOMRect): Bounds {
  return {
    h: rect.height,
    w: rect.width,
    x: rect.left,
    y: rect.top,
  }
}

function readParentElement(target: object): object | null {
  if (!('parentElement' in target)) {
    return null
  }

  const parent = target.parentElement

  return typeof parent === 'object' && parent !== null ? parent : null
}

function createResizeObserver(onResize: () => void): ResizeObserver | null {
  if (typeof ResizeObserver !== 'function') {
    return null
  }

  try {
    return new ResizeObserver(onResize)
  } catch {
    return null
  }
}

function safelyObserve(
  observer: ResizeObserver | null,
  element: HTMLElement,
) {
  try {
    observer?.observe(element)
  } catch {
    // Observation is optional runtime invalidation; reads remain live.
  }
}

function safelyUnobserve(
  observer: ResizeObserver | null,
  element: HTMLElement,
) {
  try {
    observer?.unobserve(element)
  } catch {
    // A detached or already-unobserved element needs no further cleanup.
  }
}

function safelyDisconnect(observer: ResizeObserver | null) {
  try {
    observer?.disconnect()
  } catch {
    // Disconnection is best-effort after the projection has become inert.
  }
}
