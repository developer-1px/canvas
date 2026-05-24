import {
  normalizeBounds,
  scaleItemBounds,
  type Bounds,
  type Point,
} from '../../core'
import type {
  ArrowItem,
  CanvasItem,
  HighlightItem,
  MarkerItem,
} from '../model'

const CANVAS_ARROW_BOUNDS_PAD = 12

export type CanvasStrokeDrawingItem = MarkerItem | HighlightItem
export type CanvasDrawingItem = CanvasStrokeDrawingItem | ArrowItem

export function isCanvasStrokeDrawingItem(
  item: CanvasItem,
): item is CanvasStrokeDrawingItem {
  return item.type === 'marker' || item.type === 'highlight'
}

export function isCanvasArrowDrawingItem(
  item: CanvasItem,
): item is ArrowItem {
  return item.type === 'arrow'
}

export function isCanvasDrawingItem(
  item: CanvasItem,
): item is CanvasDrawingItem {
  return isCanvasStrokeDrawingItem(item) || isCanvasArrowDrawingItem(item)
}

export function getCanvasDrawingItemBounds(
  item: CanvasDrawingItem,
): Bounds {
  return isCanvasStrokeDrawingItem(item)
    ? getCanvasStrokeDrawingItemBounds(item)
    : getCanvasArrowDrawingItemBounds(item)
}

export function syncCanvasDrawingItemBounds<TItem extends CanvasDrawingItem>(
  item: TItem,
): TItem {
  return {
    ...item,
    ...getCanvasDrawingItemBounds(item),
  }
}

export function translateCanvasDrawingItem<TItem extends CanvasDrawingItem>({
  dx,
  dy,
  item,
}: {
  dx: number
  dy: number
  item: TItem
}): TItem {
  return syncCanvasDrawingItemBounds(
    isCanvasStrokeDrawingItem(item)
      ? {
          ...item,
          points: item.points.map((point) => translatePoint(point, dx, dy)),
        }
      : {
          ...item,
          end: translatePoint(item.end, dx, dy),
          start: translatePoint(item.start, dx, dy),
        },
  ) as TItem
}

export function translateCanvasArrowAttachedEndpoints({
  attachedIds,
  dx,
  dy,
  item,
}: {
  attachedIds: ReadonlySet<string>
  dx: number
  dy: number
  item: ArrowItem
}): ArrowItem {
  const shouldTranslateStart =
    item.startAttachedTo !== undefined && attachedIds.has(item.startAttachedTo)
  const shouldTranslateEnd =
    item.endAttachedTo !== undefined && attachedIds.has(item.endAttachedTo)

  return shouldTranslateStart || shouldTranslateEnd
    ? syncCanvasDrawingItemBounds({
        ...item,
        end: shouldTranslateEnd
          ? translatePoint(item.end, dx, dy)
          : item.end,
        start: shouldTranslateStart
          ? translatePoint(item.start, dx, dy)
          : item.start,
      })
    : item
}

export function scaleCanvasDrawingItem<TItem extends CanvasDrawingItem>({
  from,
  item,
  to,
}: {
  from: Bounds
  item: TItem
  to: Bounds
}): TItem {
  const targetBounds = scaleItemBounds(
    getCanvasDrawingItemBounds(item),
    from,
    to,
  )

  if (isCanvasStrokeDrawingItem(item)) {
    return syncCanvasDrawingItemBounds({
      ...item,
      points: scalePointsToBounds({
        from: getPointBounds(item.points),
        points: item.points,
        to: insetBounds(targetBounds, item.strokeWidth / 2),
      }),
    }) as TItem
  }

  const sourceGeometryBounds = normalizeBounds(item.start, item.end)
  const targetGeometryBounds = insetBounds(
    targetBounds,
    getUniformBoundsPad(getCanvasDrawingItemBounds(item), sourceGeometryBounds),
  )

  return syncCanvasDrawingItemBounds({
    ...item,
    end: scalePoint(item.end, sourceGeometryBounds, targetGeometryBounds),
    start: scalePoint(item.start, sourceGeometryBounds, targetGeometryBounds),
  }) as TItem
}

function getCanvasStrokeDrawingItemBounds(
  item: CanvasStrokeDrawingItem,
) {
  return padBounds(getPointBounds(item.points), item.strokeWidth / 2)
}

function getCanvasArrowDrawingItemBounds(item: ArrowItem) {
  return padBounds(
    normalizeBounds(item.start, item.end),
    CANVAS_ARROW_BOUNDS_PAD,
  )
}

function getPointBounds(points: Point[]) {
  const [first = { x: 0, y: 0 }] = points
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
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

function translatePoint(point: Point, dx: number, dy: number): Point {
  return {
    x: point.x + dx,
    y: point.y + dy,
  }
}

function scalePoint(point: Point, from: Bounds, to: Bounds): Point {
  const scaleX = to.w / from.w
  const scaleY = to.h / from.h

  return {
    x: from.w === 0
      ? to.x + to.w / 2
      : to.x + (point.x - from.x) * scaleX,
    y: from.h === 0
      ? to.y + to.h / 2
      : to.y + (point.y - from.y) * scaleY,
  }
}

function scalePointsToBounds({
  from,
  points,
  to,
}: {
  from: Bounds
  points: Point[]
  to: Bounds
}) {
  return points.map((point) => scalePoint(point, from, to))
}

function padBounds(bounds: Bounds, pad: number): Bounds {
  return {
    x: bounds.x - pad,
    y: bounds.y - pad,
    w: Math.max(bounds.w + pad * 2, pad * 2),
    h: Math.max(bounds.h + pad * 2, pad * 2),
  }
}

function insetBounds(bounds: Bounds, pad: number): Bounds {
  return {
    x: bounds.x + pad,
    y: bounds.y + pad,
    w: Math.max(bounds.w - pad * 2, 0),
    h: Math.max(bounds.h - pad * 2, 0),
  }
}

function getUniformBoundsPad(outer: Bounds, inner: Bounds) {
  return Math.max(
    (outer.w - inner.w) / 2,
    (outer.h - inner.h) / 2,
    0,
  )
}
