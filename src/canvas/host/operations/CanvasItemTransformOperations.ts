import type { Bounds } from '../../core'
import type { CanvasItem } from '../model'
import { scaleItemBounds } from '../../core'
import {
  isCanvasDrawingItem,
  scaleCanvasDrawingItem,
  translateCanvasDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
import {
  getItemBounds,
  flattenCanvasItems,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import {
  isCanvasStampAttachedTo,
  isCanvasStampItem,
  translateCanvasStampItem,
} from '../stamp/CanvasStampItem'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { mapCanvasItems } from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'

export function translateCanvasItems(
  items: CanvasItem[],
  ids: string[],
  dx: number,
  dy: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))
  const movableSelected = getMovableSelectedCanvasItemIds(items, selected)

  return mapCanvasItems(items, (item) =>
    shouldTranslateCanvasItem(item, movableSelected) && !isCanvasItemLocked(item)
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
  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      x: item.x + dx,
      y: item.y + dy,
      children: item.children.map((child) => translateCanvasItem(child, dx, dy)),
    })
  }

  if (isCanvasDrawingItem(item)) {
    return translateCanvasDrawingItem({
      dx,
      dy,
      item,
    })
  }

  if (isCanvasStampItem(item)) {
    return translateCanvasStampItem({
      dx,
      dy,
      item,
    })
  }

  return {
    ...item,
    x: item.x + dx,
    y: item.y + dy,
  }
}

function getMovableSelectedCanvasItemIds(
  items: CanvasItem[],
  selected: ReadonlySet<string>,
) {
  return new Set(
    flattenCanvasItems(items)
      .filter((entry) =>
        selected.has(entry.item.id) && !isCanvasItemLocked(entry.item),
      )
      .map((entry) => entry.item.id),
  )
}

function shouldTranslateCanvasItem(
  item: CanvasItem,
  movableSelected: ReadonlySet<string>,
) {
  return movableSelected.has(item.id) ||
    isCanvasStampAttachedTo(item, movableSelected)
}

function scaleCanvasItem(item: CanvasItem, from: Bounds, to: Bounds): CanvasItem {
  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      ...scaleItemBounds(getItemBounds(item), from, to),
      children: item.children.map((child) => scaleCanvasItem(child, from, to)),
    })
  }

  if (isCanvasDrawingItem(item)) {
    return scaleCanvasDrawingItem({
      from,
      item,
      to,
    })
  }

  return {
    ...item,
    ...scaleItemBounds(getItemBounds(item), from, to),
  }
}
