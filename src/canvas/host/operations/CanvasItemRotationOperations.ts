import type { Bounds } from '../../core'
import type {
  CanvasComponentItem,
  CanvasItem,
} from '../model'
import { isCanvasStickyComponentItem } from '../component/CanvasStickyComponent'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import {
  flattenCanvasItems,
  pruneNestedSelection,
  syncCanvasItems,
} from '../tree/CanvasTree'
import { mapCanvasItems } from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'

export type CanvasRotatableItem = Extract<
  CanvasItem,
  { type: 'comment' | 'image' | 'rect' | 'shape' | 'text' }
> | CanvasComponentItem

export function isCanvasRotatableItem(
  item: CanvasItem,
): item is CanvasRotatableItem {
  return (
    item.type === 'comment' ||
    item.type === 'image' ||
    item.type === 'rect' ||
    item.type === 'shape' ||
    item.type === 'text' ||
    isCanvasStickyComponentItem(item)
  )
}

export function canRotateCanvasItem(item: CanvasItem) {
  return isCanvasRotatableItem(item) && !isCanvasItemLocked(item)
}

export function canRotateCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = getSelectedCanvasRotationItems(items, ids)

  return selected.length > 0 && selected.every(canRotateCanvasItem)
}

export function rotateCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  deltaDegrees: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return syncCanvasItems(
    mapCanvasItems(items, (item) =>
      selected.has(item.id)
        ? rotateCanvasItem(item, deltaDegrees)
        : item,
    ),
  )
}

export function resetCanvasSelectionRotation(
  items: CanvasItem[],
  ids: string[],
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return syncCanvasItems(
    mapCanvasItems(items, (item) =>
      selected.has(item.id)
        ? setCanvasItemRotation(item, 0)
        : item,
    ),
  )
}

export function rotateCanvasItem<TItem extends CanvasItem>(
  item: TItem,
  deltaDegrees: number,
): TItem {
  return setCanvasItemRotation(
    item,
    getCanvasItemRotation(item) + deltaDegrees,
  )
}

export function setCanvasItemRotation<TItem extends CanvasItem>(
  item: TItem,
  degrees: number,
): TItem {
  if (!canRotateCanvasItem(item)) {
    return item
  }

  const rotation = normalizeCanvasItemRotation(degrees)
  const nextItem = { ...item, rotation } as TItem

  if (rotation === 0) {
    delete nextItem.rotation
  }

  return nextItem
}

export function getCanvasItemRotation(item: CanvasItem) {
  return isCanvasRotatableItem(item)
    ? normalizeCanvasItemRotation(item.rotation ?? 0)
    : 0
}

export function hasCanvasItemRotation(item: CanvasItem) {
  return getCanvasItemRotation(item) !== 0
}

export function getCanvasSelectionRotation(items: CanvasItem[], ids: string[]) {
  const selected = getSelectedCanvasRotationItems(items, ids)
  const rotations = selected.map(getCanvasItemRotation)
  const [first] = rotations

  if (first === undefined) {
    return null
  }

  return rotations.every((rotation) => rotation === first) ? first : null
}

export function hasCanvasSelectionRotation(items: CanvasItem[], ids: string[]) {
  return getSelectedCanvasRotationItems(items, ids)
    .some(hasCanvasItemRotation)
}

export function canResizeCanvasItem(item: CanvasItem): boolean {
  if (hasCanvasItemRotation(item)) {
    return false
  }

  return isCanvasGroupItem(item)
    ? item.children.every(canResizeCanvasItem)
    : true
}

export function getCanvasRotatedBounds(
  bounds: Bounds,
  degrees: number,
): Bounds {
  const rotation = normalizeCanvasItemRotation(degrees)

  if (rotation === 0) {
    return bounds
  }

  const radians = rotation * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const center = {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  }
  const corners = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.w, y: bounds.y },
    { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    { x: bounds.x, y: bounds.y + bounds.h },
  ].map((point) => {
    const dx = point.x - center.x
    const dy = point.y - center.y

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    }
  })
  const xs = corners.map((point) => point.x)
  const ys = corners.map((point) => point.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

export function getCanvasItemRotationTransform(item: CanvasItem) {
  const rotation = getCanvasItemRotation(item)

  if (rotation === 0) {
    return undefined
  }

  const center = {
    x: item.x + item.w / 2,
    y: item.y + item.h / 2,
  }

  return `rotate(${rotation} ${center.x} ${center.y})`
}

export function normalizeCanvasItemRotation(degrees: number) {
  if (!Number.isFinite(degrees)) {
    return 0
  }

  const normalized = degrees % 360

  return normalized < 0 ? normalized + 360 : normalized
}

function getSelectedCanvasRotationItems(items: CanvasItem[], ids: string[]) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return flattenCanvasItems(items)
    .filter((entry) => selected.has(entry.item.id))
    .map((entry) => entry.item)
}
