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

export type CanvasSequentialIdFactoryFormatInput = {
  index: number
  prefix: string
}

export type CanvasSequentialIdFactoryInput = {
  existingIds?: Iterable<string>
  formatId?: (input: CanvasSequentialIdFactoryFormatInput) => string
  startIndex?: number
}

export type CanvasBoundsAnchor = 'bottom' | 'center' | 'left' | 'right' | 'top'

export type ClampCanvasBoundsToFrameInput = {
  bounds: Bounds
  frame: Bounds
  minHeight?: number
  minWidth?: number
}

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

export function getCanvasBoundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  }
}

export function getCanvasBoundsAnchorPoint(
  bounds: Bounds,
  anchor: CanvasBoundsAnchor,
): Point {
  const center = getCanvasBoundsCenter(bounds)

  switch (anchor) {
    case 'bottom':
      return { x: center.x, y: bounds.y + bounds.h }
    case 'center':
      return center
    case 'left':
      return { x: bounds.x, y: center.y }
    case 'right':
      return { x: bounds.x + bounds.w, y: center.y }
    case 'top':
      return { x: center.x, y: bounds.y }
  }
}

export function getCanvasBoundsAnchorPoints(
  bounds: Bounds,
): Record<CanvasBoundsAnchor, Point> {
  return {
    bottom: getCanvasBoundsAnchorPoint(bounds, 'bottom'),
    center: getCanvasBoundsAnchorPoint(bounds, 'center'),
    left: getCanvasBoundsAnchorPoint(bounds, 'left'),
    right: getCanvasBoundsAnchorPoint(bounds, 'right'),
    top: getCanvasBoundsAnchorPoint(bounds, 'top'),
  }
}

export function clampCanvasBoundsToFrame({
  bounds,
  frame,
  minHeight = 1,
  minWidth = 1,
}: ClampCanvasBoundsToFrameInput): Bounds {
  const maxWidth = Math.max(0, frame.w)
  const maxHeight = Math.max(0, frame.h)
  const boundedMinWidth = clamp(minWidth, 0, maxWidth)
  const boundedMinHeight = clamp(minHeight, 0, maxHeight)
  const w = clamp(bounds.w, boundedMinWidth, maxWidth)
  const h = clamp(bounds.h, boundedMinHeight, maxHeight)

  return {
    h,
    w,
    x: clamp(bounds.x, frame.x, frame.x + maxWidth - w),
    y: clamp(bounds.y, frame.y, frame.y + maxHeight - h),
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

export function createCanvasSequentialIdFactory({
  existingIds = [],
  formatId = formatDefaultCanvasSequentialId,
  startIndex = 1,
}: CanvasSequentialIdFactoryInput = {}) {
  const ids = new Set(existingIds)
  let nextIndex = normalizeCanvasSequentialIdIndex(startIndex)

  return (prefix: string) => {
    let id = formatId({ index: nextIndex, prefix })

    while (ids.has(id)) {
      nextIndex += 1
      id = formatId({ index: nextIndex, prefix })
    }

    ids.add(id)
    nextIndex += 1

    return id
  }
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

function formatDefaultCanvasSequentialId({
  index,
  prefix,
}: CanvasSequentialIdFactoryFormatInput) {
  return `${prefix}-${index}`
}

function normalizeCanvasSequentialIdIndex(value: number) {
  return Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1
}
