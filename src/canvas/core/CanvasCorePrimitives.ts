import type {
  Bounds,
  Point,
  Viewport,
} from './CanvasCoreTypes'

export type {
  Bounds,
  CanvasInteractionKind,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from './CanvasCoreTypes'
export {
  MIN_ITEM_SIZE,
  RESIZE_HANDLES,
  handlePoint,
  resizeBounds,
  scaleItemBounds,
  type ResizeBoundsOptions,
} from './CanvasBoundsResize'

export type CanvasViewportRect = {
  height: number
  width: number
}

export const INITIAL_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  scale: 1,
}

export const CANVAS_ZOOM_STEPS = Object.freeze([
  0.1,
  0.25,
  0.5,
  1,
  2,
  4,
  8,
] as const)
export const MIN_SCALE = CANVAS_ZOOM_STEPS[0]
export const MAX_SCALE = CANVAS_ZOOM_STEPS[CANVAS_ZOOM_STEPS.length - 1]
export const CANVAS_FIT_VIEWPORT_PADDING = 96
export const DRAG_THRESHOLD = 3

export type CanvasViewportZoomDirection = 'in' | 'out'

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

export function getCanvasViewportWorldPoint(
  viewport: Viewport,
  point: Point,
): Point {
  const { scale, x: viewportX, y: viewportY } = getCanvasViewportTransform(
    viewport,
  )

  return {
    x: (point.x - viewportX) / scale,
    y: (point.y - viewportY) / scale,
  }
}

export function getCanvasViewportScreenPoint(
  viewport: Viewport,
  point: Point,
): Point {
  const { scale, x: viewportX, y: viewportY } = getCanvasViewportTransform(
    viewport,
  )

  return {
    x: viewportX + point.x * scale,
    y: viewportY + point.y * scale,
  }
}

export function getCanvasViewportWorldBounds(
  viewport: Viewport,
  rect: CanvasViewportRect,
): Bounds {
  const scale = getCanvasViewportScale(viewport)
  const topLeft = getCanvasViewportWorldPoint(viewport, { x: 0, y: 0 })

  return {
    h: Math.max(1, rect.height / scale),
    w: Math.max(1, rect.width / scale),
    x: topLeft.x,
    y: topLeft.y,
  }
}

export function getCanvasViewportScreenBounds(
  viewport: Viewport,
  bounds: Bounds,
): Bounds {
  const scale = getCanvasViewportScale(viewport)
  const topLeft = getCanvasViewportScreenPoint(viewport, bounds)

  return {
    h: bounds.h * scale,
    w: bounds.w * scale,
    x: topLeft.x,
    y: topLeft.y,
  }
}

export function getCanvasViewportScale(viewport: Pick<Viewport, 'scale'>) {
  return clamp(viewport.scale, MIN_SCALE, MAX_SCALE)
}

export function normalizeBounds(a: Point, b: Point): Bounds {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  }
}

export function fitBoundsIntoViewport(
  bounds: Bounds,
  rect: CanvasViewportRect,
): Viewport {
  const padding = CANVAS_FIT_VIEWPORT_PADDING
  const availableWidth = Math.max(1, rect.width - padding * 2)
  const availableHeight = Math.max(1, rect.height - padding * 2)
  const scale = clamp(
    Math.min(availableWidth / bounds.w, availableHeight / bounds.h),
    MIN_SCALE,
    MAX_SCALE,
  )

  return {
    scale,
    x: (rect.width - bounds.w * scale) / 2 - bounds.x * scale,
    y: (rect.height - bounds.h * scale) / 2 - bounds.y * scale,
  }
}

export function pointDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function unique<TId extends string>(ids: readonly TId[]): TId[] {
  return Array.from(new Set(ids))
}

export function zoomViewport(current: Viewport, point: Point, multiplier: number) {
  const currentScale = clamp(current.scale, MIN_SCALE, MAX_SCALE)
  const nextScale = clamp(currentScale * multiplier, MIN_SCALE, MAX_SCALE)
  const worldPoint = getCanvasViewportWorldPoint(current, point)

  return {
    scale: nextScale,
    x: point.x - worldPoint.x * nextScale,
    y: point.y - worldPoint.y * nextScale,
  }
}

export function getCanvasViewportZoomStep(
  scale: number,
  direction: CanvasViewportZoomDirection,
) {
  const currentScale = clamp(scale, MIN_SCALE, MAX_SCALE)
  const epsilon = 0.000001

  if (direction === 'in') {
    return CANVAS_ZOOM_STEPS.find((step) => step > currentScale + epsilon) ??
      MAX_SCALE
  }

  return [...CANVAS_ZOOM_STEPS]
    .reverse()
    .find((step) => step < currentScale - epsilon) ?? MIN_SCALE
}

export function getCanvasViewportZoomStepMultiplier(
  scale: number,
  direction: CanvasViewportZoomDirection,
) {
  const currentScale = clamp(scale, MIN_SCALE, MAX_SCALE)

  return getCanvasViewportZoomStep(currentScale, direction) / currentScale
}

function getCanvasViewportTransform(viewport: Viewport) {
  return {
    scale: getCanvasViewportScale(viewport),
    x: Number.isFinite(viewport.x) ? viewport.x : 0,
    y: Number.isFinite(viewport.y) ? viewport.y : 0,
  }
}
