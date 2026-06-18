import {
  getCanvasPointBounds,
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
  PathItem,
} from '../model'
import {
  getCanvasArrowLabelBounds,
} from './CanvasArrowLabelGeometry'

const CANVAS_ARROW_BOUNDS_PAD = 12

export {
  getCanvasArrowLabelBounds,
} from './CanvasArrowLabelGeometry'

export type CanvasStrokeDrawingItem = MarkerItem | HighlightItem
export type CanvasPathDrawingItem = PathItem
export type CanvasDrawingItem =
  | CanvasStrokeDrawingItem
  | CanvasPathDrawingItem
  | ArrowItem

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

export function isCanvasPathDrawingItem(
  item: CanvasItem,
): item is CanvasPathDrawingItem {
  return item.type === 'path'
}

export function isCanvasDrawingItem(
  item: CanvasItem,
): item is CanvasDrawingItem {
  return (
    isCanvasStrokeDrawingItem(item) ||
    isCanvasPathDrawingItem(item) ||
    isCanvasArrowDrawingItem(item)
  )
}

export function getCanvasDrawingItemBounds(
  item: CanvasDrawingItem,
): Bounds {
  return isCanvasStrokeDrawingItem(item)
    ? getCanvasStrokeDrawingItemBounds(item)
    : isCanvasPathDrawingItem(item)
      ? getCanvasPathDrawingItemBounds(item)
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
      : isCanvasPathDrawingItem(item)
        ? {
            ...item,
            segments: item.segments.map((segment) =>
              translateCanvasPathSegment(segment, dx, dy)),
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
        from: getCanvasPointBounds(item.points),
        points: item.points,
        to: insetBounds(targetBounds, item.strokeWidth / 2),
      }),
    }) as TItem
  }

  if (isCanvasPathDrawingItem(item)) {
    const sourcePathBounds = getCanvasPointBounds(
      getCanvasPathSegmentPoints(item.segments),
    )

    return syncCanvasDrawingItemBounds({
      ...item,
      segments: item.segments.map((segment) =>
        scaleCanvasPathSegment(
          segment,
          sourcePathBounds,
          insetBounds(targetBounds, item.strokeWidth / 2),
        )),
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
  return padBounds(getCanvasPointBounds(item.points), item.strokeWidth / 2)
}

function getCanvasPathDrawingItemBounds(
  item: CanvasPathDrawingItem,
) {
  return padBounds(
    getCanvasPointBounds(getCanvasPathSegmentPoints(item.segments)),
    item.strokeWidth / 2,
  )
}

function getCanvasArrowDrawingItemBounds(item: ArrowItem) {
  const arrowBounds = padBounds(
    normalizeBounds(item.start, item.end),
    CANVAS_ARROW_BOUNDS_PAD,
  )

  return item.text?.trim()
    ? unionBounds(arrowBounds, getCanvasArrowLabelBounds(item))
    : arrowBounds
}

function translatePoint(point: Point, dx: number, dy: number): Point {
  return {
    x: point.x + dx,
    y: point.y + dy,
  }
}

function translateCanvasPathSegment(
  segment: PathItem['segments'][number],
  dx: number,
  dy: number,
): PathItem['segments'][number] {
  if (segment.type === 'cubic') {
    return {
      ...segment,
      control1: translatePoint(segment.control1, dx, dy),
      control2: translatePoint(segment.control2, dx, dy),
      point: translatePoint(segment.point, dx, dy),
    }
  }

  return {
    ...segment,
    point: translatePoint(segment.point, dx, dy),
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

function scaleCanvasPathSegment(
  segment: PathItem['segments'][number],
  from: Bounds,
  to: Bounds,
): PathItem['segments'][number] {
  if (segment.type === 'cubic') {
    return {
      ...segment,
      control1: scalePoint(segment.control1, from, to),
      control2: scalePoint(segment.control2, from, to),
      point: scalePoint(segment.point, from, to),
    }
  }

  return {
    ...segment,
    point: scalePoint(segment.point, from, to),
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

function getCanvasPathSegmentPoints(
  segments: readonly PathItem['segments'][number][],
) {
  return segments.flatMap((segment) =>
    segment.type === 'cubic'
      ? [segment.control1, segment.control2, segment.point]
      : [segment.point],
  )
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

function unionBounds(left: Bounds, right: Bounds): Bounds {
  const minX = Math.min(left.x, right.x)
  const minY = Math.min(left.y, right.y)
  const maxX = Math.max(left.x + left.w, right.x + right.w)
  const maxY = Math.max(left.y + left.h, right.y + right.h)

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}
