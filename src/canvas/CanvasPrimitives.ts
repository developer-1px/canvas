export type Tool = 'select' | 'pan' | 'rect' | 'text'

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-rect'
  | 'resize'

export type Point = {
  x: number
  y: number
}

export type Viewport = Point & {
  scale: number
}

export type Bounds = Point & {
  w: number
  h: number
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export const INITIAL_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  scale: 1,
}

export const MIN_SCALE = 0.2
export const MAX_SCALE = 5
export const DRAG_THRESHOLD = 3
export const MIN_ITEM_SIZE = 24
export const RESIZE_HANDLES: ResizeHandle[] = [
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
]

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

export function fitBoundsIntoViewport(bounds: Bounds, rect: DOMRect): Viewport {
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

export function resizeBounds(
  bounds: Bounds,
  handle: ResizeHandle,
  point: Point,
): Bounds {
  let left = bounds.x
  let right = bounds.x + bounds.w
  let top = bounds.y
  let bottom = bounds.y + bounds.h

  if (handle.includes('w')) {
    left = Math.min(point.x, right - MIN_ITEM_SIZE)
  }

  if (handle.includes('e')) {
    right = Math.max(point.x, left + MIN_ITEM_SIZE)
  }

  if (handle.includes('n')) {
    top = Math.min(point.y, bottom - MIN_ITEM_SIZE)
  }

  if (handle.includes('s')) {
    bottom = Math.max(point.y, top + MIN_ITEM_SIZE)
  }

  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  }
}

export function scaleItemBounds(origin: Bounds, from: Bounds, to: Bounds): Bounds {
  const scaleX = to.w / from.w
  const scaleY = to.h / from.h

  return {
    x: to.x + (origin.x - from.x) * scaleX,
    y: to.y + (origin.y - from.y) * scaleY,
    w: Math.max(MIN_ITEM_SIZE, origin.w * scaleX),
    h: Math.max(MIN_ITEM_SIZE, origin.h * scaleY),
  }
}

export function handlePoint(bounds: Bounds, handle: ResizeHandle): Point {
  const centerX = bounds.x + bounds.w / 2
  const centerY = bounds.y + bounds.h / 2
  const right = bounds.x + bounds.w
  const bottom = bounds.y + bounds.h

  return {
    x: handle.includes('w') ? bounds.x : handle.includes('e') ? right : centerX,
    y: handle.includes('n') ? bounds.y : handle.includes('s') ? bottom : centerY,
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
