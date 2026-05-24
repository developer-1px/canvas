import {
  normalizeBounds,
  scaleItemBounds,
  type Bounds,
  type Point,
} from '../../core'
import type {
  ArrowItem,
  CanvasArrowRouting,
  CanvasItem,
  GroupItem,
  HighlightItem,
  MarkerItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

const CANVAS_ARROW_BOUNDS_PAD = 12
const CANVAS_ARROW_LABEL_HEIGHT = 32
const CANVAS_ARROW_LABEL_MAX_WIDTH = 220
const CANVAS_ARROW_LABEL_MIN_WIDTH = 96
const CANVAS_ARROW_LABEL_PADDING_X = 28
const CANVAS_ARROW_LABEL_TEXT_WIDTH = 7

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

export function isCanvasArrowRouting(
  value: unknown,
): value is CanvasArrowRouting {
  return value === 'elbow' || value === 'straight'
}

export function normalizeCanvasArrowRouting(
  value: unknown,
): CanvasArrowRouting {
  return value === 'straight' ? 'straight' : 'elbow'
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

export function setCanvasArrowRouting(
  item: ArrowItem,
  routing: CanvasArrowRouting,
): ArrowItem {
  return {
    ...item,
    routing,
  }
}

export function replaceCanvasArrowRoutings(
  items: readonly CanvasItem[],
  selection: readonly string[],
  routing: CanvasArrowRouting,
): CanvasItem[] {
  const selected = new Set(selection)

  return items.map((item) =>
    replaceCanvasArrowItemRouting(item, selected, routing),
  )
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

export function getCanvasArrowLabelBounds(item: ArrowItem): Bounds {
  const width = getCanvasArrowLabelWidth(item.text ?? '')
  const midpoint = {
    x: (item.start.x + item.end.x) / 2,
    y: (item.start.y + item.end.y) / 2,
  }

  return {
    x: midpoint.x - width / 2,
    y: midpoint.y - CANVAS_ARROW_LABEL_HEIGHT / 2,
    w: width,
    h: CANVAS_ARROW_LABEL_HEIGHT,
  }
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

function replaceCanvasArrowItemRouting(
  item: CanvasItem,
  selected: Set<string>,
  routing: CanvasArrowRouting,
): CanvasItem {
  if (isCanvasArrowDrawingItem(item) && selected.has(item.id)) {
    return setCanvasArrowRouting(item, routing)
  }

  if (isCanvasGroupItem(item)) {
    return replaceCanvasArrowChildrenRouting(item, selected, routing)
  }

  return item
}

function replaceCanvasArrowChildrenRouting(
  item: GroupItem,
  selected: Set<string>,
  routing: CanvasArrowRouting,
): GroupItem {
  const nextChildren = item.children.map((child) =>
    replaceCanvasArrowItemRouting(child, selected, routing),
  )

  return nextChildren.every((child, index) => child === item.children[index])
    ? item
    : { ...item, children: nextChildren }
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

function getCanvasArrowLabelWidth(text: string) {
  const longestLine = text
    .split('\n')
    .reduce((length, line) => Math.max(length, line.length), 0)

  return Math.min(
    Math.max(
      longestLine * CANVAS_ARROW_LABEL_TEXT_WIDTH +
        CANVAS_ARROW_LABEL_PADDING_X,
      CANVAS_ARROW_LABEL_MIN_WIDTH,
    ),
    CANVAS_ARROW_LABEL_MAX_WIDTH,
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
