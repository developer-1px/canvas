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

export const MIN_SCALE = 0.2
export const MAX_SCALE = 5
export const DRAG_THRESHOLD = 3

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
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
  const padding = 96
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

export function unique(ids: string[]) {
  return Array.from(new Set(ids))
}

export function zoomViewport(current: Viewport, point: Point, multiplier: number) {
  const nextScale = clamp(current.scale * multiplier, MIN_SCALE, MAX_SCALE)
  const worldPoint = {
    x: (point.x - current.x) / current.scale,
    y: (point.y - current.y) / current.scale,
  }

  return {
    scale: nextScale,
    x: point.x - worldPoint.x * nextScale,
    y: point.y - worldPoint.y * nextScale,
  }
}
