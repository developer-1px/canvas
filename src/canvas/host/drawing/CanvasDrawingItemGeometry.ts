import {
  getCanvasPointBounds,
  normalizeBounds,
  scaleItemBounds,
  type Bounds,
} from '../../core'
import type {
  ArrowItem,
  CanvasItem,
  HighlightItem,
  MarkerItem,
  PathItem,
} from '../model'
import {
  getCanvasArrowDrawingItemBounds,
  getCanvasPathDrawingItemBounds,
  getCanvasStrokeDrawingItemBounds,
} from './CanvasDrawingItemBounds'
import {
  getUniformBoundsPad,
  insetBounds,
} from './CanvasDrawingBoundsTransforms'
import {
  getCanvasPathSegmentPoints,
  scaleCanvasPathSegment,
  scalePoint,
  scalePointsToBounds,
  translateCanvasPathSegment,
  translatePoint,
} from './CanvasDrawingItemTransformPrimitives'

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
