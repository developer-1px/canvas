import type {
  Bounds,
  Point,
} from '../../core'
import type { CanvasItem } from '../model'
import {
  normalizeBounds,
  scaleItemBounds,
} from '../../core'
import {
  getItemBounds,
  pruneNestedSelection,
  syncCanvasItemBounds,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { mapCanvasItems } from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'

export function translateCanvasItems(
  items: CanvasItem[],
  ids: string[],
  dx: number,
  dy: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return mapCanvasItems(items, (item) =>
    selected.has(item.id) && !isCanvasItemLocked(item)
      ? translateCanvasItem(item, dx, dy)
      : item,
  )
}

export function resizeCanvasItems(
  items: CanvasItem[],
  ids: string[],
  from: Bounds,
  to: Bounds,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return mapCanvasItems(items, (item) =>
    selected.has(item.id) && !isCanvasItemLocked(item)
      ? scaleCanvasItem(item, from, to)
      : item,
  )
}

function translateCanvasItem(item: CanvasItem, dx: number, dy: number): CanvasItem {
  if (item.type === 'group') {
    return syncGroupBounds({
      ...item,
      x: item.x + dx,
      y: item.y + dy,
      children: item.children.map((child) => translateCanvasItem(child, dx, dy)),
    })
  }

  if (item.type === 'marker' || item.type === 'highlight') {
    return syncCanvasItemBounds({
      ...item,
      points: item.points.map((point) => translatePoint(point, dx, dy)),
    })
  }

  if (item.type === 'arrow') {
    return syncCanvasItemBounds({
      ...item,
      start: translatePoint(item.start, dx, dy),
      end: translatePoint(item.end, dx, dy),
    })
  }

  return {
    ...item,
    x: item.x + dx,
    y: item.y + dy,
  }
}

function scaleCanvasItem(item: CanvasItem, from: Bounds, to: Bounds): CanvasItem {
  if (item.type === 'group') {
    return syncGroupBounds({
      ...item,
      ...scaleItemBounds(getItemBounds(item), from, to),
      children: item.children.map((child) => scaleCanvasItem(child, from, to)),
    })
  }

  if (item.type === 'marker' || item.type === 'highlight') {
    const targetBounds = scaleItemBounds(getItemBounds(item), from, to)

    return syncCanvasItemBounds({
      ...item,
      points: scalePointsToBounds({
        from: getPointBounds(item.points),
        points: item.points,
        to: insetBounds(targetBounds, item.strokeWidth / 2),
      }),
    })
  }

  if (item.type === 'arrow') {
    const sourceGeometryBounds = normalizeBounds(item.start, item.end)
    const targetBounds = scaleItemBounds(getItemBounds(item), from, to)
    const targetGeometryBounds = insetBounds(
      targetBounds,
      getUniformBoundsPad(getItemBounds(item), sourceGeometryBounds),
    )

    return syncCanvasItemBounds({
      ...item,
      start: scalePoint(item.start, sourceGeometryBounds, targetGeometryBounds),
      end: scalePoint(item.end, sourceGeometryBounds, targetGeometryBounds),
    })
  }

  return {
    ...item,
    ...scaleItemBounds(getItemBounds(item), from, to),
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
