import type {
  Bounds,
  Point,
} from './CanvasCoreTypes'
import {
  clamp,
} from './CanvasCoreMath'

export type CanvasBoundsAnchor = 'bottom' | 'center' | 'left' | 'right' | 'top'

export type ClampCanvasBoundsToFrameInput = {
  bounds: Bounds
  frame: Bounds
  minHeight?: number
  minWidth?: number
}

export type NormalizeCanvasPointsToLocalBoundsInput = {
  fallbackPoint?: Point
  frame?: Bounds
  minHeight?: number
  minWidth?: number
  padding?: number
  points: readonly Point[]
}

export type NormalizedCanvasLocalPoints = {
  bounds: Bounds
  points: Point[]
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

export function clampCanvasPointToBounds(point: Point, bounds: Bounds): Point {
  return {
    x: clamp(point.x, bounds.x, bounds.x + bounds.w),
    y: clamp(point.y, bounds.y, bounds.y + bounds.h),
  }
}

export function getCanvasPointBounds(
  points: readonly Point[],
  fallbackPoint: Point = { x: 0, y: 0 },
): Bounds {
  const [first = fallbackPoint] = points
  let minX = first.x
  let minY = first.y
  let maxX = first.x
  let maxY = first.y

  for (const point of points.slice(1)) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    h: maxY - minY,
    w: maxX - minX,
    x: minX,
    y: minY,
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

export function normalizeCanvasPointsToLocalBounds({
  fallbackPoint = { x: 0, y: 0 },
  frame,
  minHeight = 1,
  minWidth = 1,
  padding = 0,
  points,
}: NormalizeCanvasPointsToLocalBoundsInput): NormalizedCanvasLocalPoints {
  const sourcePoints = points.length > 0
    ? points
    : [fallbackPoint]
  const safePoints = frame
    ? sourcePoints.map((point) => clampCanvasPointToBounds(point, frame))
    : sourcePoints.map((point) => ({ ...point }))
  const rawBounds = getCanvasPointBounds(safePoints, fallbackPoint)
  const safePadding = Math.max(0, Number.isFinite(padding) ? padding : 0)
  const safeMinWidth = Math.max(0, Number.isFinite(minWidth) ? minWidth : 0)
  const safeMinHeight = Math.max(0, Number.isFinite(minHeight) ? minHeight : 0)
  const width = Math.max(safeMinWidth, rawBounds.w + safePadding * 2)
  const height = Math.max(safeMinHeight, rawBounds.h + safePadding * 2)
  const bounds = {
    h: height,
    w: width,
    x: rawBounds.x - Math.max(safePadding, (width - rawBounds.w) / 2),
    y: rawBounds.y - Math.max(safePadding, (height - rawBounds.h) / 2),
  }
  const localBounds = frame
    ? clampCanvasBoundsToFrame({
        bounds,
        frame,
        minHeight: safeMinHeight,
        minWidth: safeMinWidth,
      })
    : bounds

  return {
    bounds: localBounds,
    points: safePoints.map((point) => ({
      x: point.x - localBounds.x,
      y: point.y - localBounds.y,
    })),
  }
}
