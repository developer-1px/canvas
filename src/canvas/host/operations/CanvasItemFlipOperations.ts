import type { Point } from '../../core'
import type {
  CanvasItem,
  CanvasPathSegment,
} from '../model'
import {
  flattenCanvasItems,
  getItemsBounds,
  pruneNestedSelection,
  syncCanvasItems,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import type { CanvasDrawingItem } from '../drawing/CanvasDrawingItemGeometry'
import {
  isCanvasDrawingItem,
  isCanvasPathDrawingItem,
  isCanvasStrokeDrawingItem,
  syncCanvasDrawingItemBounds,
} from '../drawing/CanvasDrawingItemGeometry'
import { mapCanvasItems } from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'
import {
  getCanvasItemRotation,
  isCanvasRotatableItem,
  setCanvasItemRotation,
} from './CanvasItemRotationOperations'

export type CanvasFlipAxis = 'horizontal' | 'vertical'

export function canFlipCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = getSelectedCanvasFlipItems(items, ids)

  return selected.length > 0 && selected.every((item) => !isCanvasItemLocked(item))
}

export function flipCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  axis: CanvasFlipAxis,
) {
  const selectedIds = new Set(pruneNestedSelection(items, ids))
  const selected = flattenCanvasItems(items)
    .filter((entry) => selectedIds.has(entry.item.id))
    .map((entry) => entry.item)
  const bounds = getItemsBounds(selected)

  if (!bounds || selected.some(isCanvasItemLocked)) {
    return items
  }

  const pivot = axis === 'horizontal'
    ? bounds.x + bounds.w / 2
    : bounds.y + bounds.h / 2

  return syncCanvasItems(
    mapCanvasItems(items, (item) =>
      selectedIds.has(item.id) ? flipCanvasItem(item, axis, pivot) : item,
    ),
  )
}

function flipCanvasItem<TItem extends CanvasItem>(
  item: TItem,
  axis: CanvasFlipAxis,
  pivot: number,
): TItem {
  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      children: item.children.map((child) =>
        flipCanvasItem(child, axis, pivot),
      ),
    }) as TItem
  }

  if (isCanvasDrawingItem(item)) {
    return flipCanvasDrawingItem(item, axis, pivot) as TItem
  }

  const next = axis === 'horizontal'
    ? { ...item, x: 2 * pivot - (item.x + item.w) }
    : { ...item, y: 2 * pivot - (item.y + item.h) }

  return flipCanvasItemRotation(next as TItem, axis)
}

function flipCanvasItemRotation<TItem extends CanvasItem>(
  item: TItem,
  axis: CanvasFlipAxis,
): TItem {
  if (!isCanvasRotatableItem(item)) {
    return item
  }

  const rotation = getCanvasItemRotation(item)

  if (rotation === 0) {
    return item
  }

  // Reflecting a rotated box maps θ → 180 − θ across a vertical axis and
  // θ → −θ across a horizontal axis.
  const flipped = axis === 'horizontal' ? 180 - rotation : -rotation

  return setCanvasItemRotation(item, flipped)
}

function flipCanvasDrawingItem<TItem extends CanvasDrawingItem>(
  item: TItem,
  axis: CanvasFlipAxis,
  pivot: number,
): TItem {
  const reflect = (point: Point): Point =>
    axis === 'horizontal'
      ? { x: 2 * pivot - point.x, y: point.y }
      : { x: point.x, y: 2 * pivot - point.y }

  if (isCanvasStrokeDrawingItem(item)) {
    return syncCanvasDrawingItemBounds({
      ...item,
      points: item.points.map(reflect),
    }) as TItem
  }

  if (isCanvasPathDrawingItem(item)) {
    return syncCanvasDrawingItemBounds({
      ...item,
      segments: item.segments.map((segment) =>
        reflectCanvasPathSegment(segment, reflect)),
    }) as TItem
  }

  return syncCanvasDrawingItemBounds({
    ...item,
    end: reflect(item.end),
    start: reflect(item.start),
  }) as TItem
}

function reflectCanvasPathSegment(
  segment: CanvasPathSegment,
  reflect: (point: Point) => Point,
): CanvasPathSegment {
  if (segment.type === 'cubic') {
    return {
      ...segment,
      control1: reflect(segment.control1),
      control2: reflect(segment.control2),
      point: reflect(segment.point),
    }
  }

  return {
    ...segment,
    point: reflect(segment.point),
  }
}

function getSelectedCanvasFlipItems(items: CanvasItem[], ids: string[]) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return flattenCanvasItems(items)
    .filter((entry) => selected.has(entry.item.id))
    .map((entry) => entry.item)
}
