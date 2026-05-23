import type {
  Bounds,
  Point,
} from '../../core'
import type { CanvasItem } from '../model'
import {
  scaleItemBounds,
} from '../../core'
import {
  getItemBounds,
  pruneNestedSelection,
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

  if (item.type === 'arrow') {
    return {
      ...item,
      x: item.x + dx,
      y: item.y + dy,
      start: translatePoint(item.start, dx, dy),
      end: translatePoint(item.end, dx, dy),
    }
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

  if (item.type === 'arrow') {
    return {
      ...item,
      ...scaleItemBounds(getItemBounds(item), from, to),
      start: scalePoint(item.start, from, to),
      end: scalePoint(item.end, from, to),
    }
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
    x: to.x + (point.x - from.x) * scaleX,
    y: to.y + (point.y - from.y) * scaleY,
  }
}
