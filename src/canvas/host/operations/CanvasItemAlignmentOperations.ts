import type { Bounds } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem } from '../model/CanvasModel'
import {
  flattenCanvasItems,
  getItemBounds,
  getItemsBounds,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import {
  replaceCanvasChildrenAtPath,
  sameCanvasPath,
} from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'

export type CanvasAlignMode =
  | 'alignBottom'
  | 'alignCenter'
  | 'alignLeft'
  | 'alignMiddle'
  | 'alignRight'
  | 'alignTop'

export type CanvasDistributeMode =
  | 'distributeHorizontal'
  | 'distributeVertical'

export function alignCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  mode: CanvasAlignMode,
) {
  const entries = getSelectedSiblingEntries(items, ids, 2)

  if (!entries) {
    return items
  }

  const bounds = getItemsBounds(entries.map((entry) => entry.item))

  if (!bounds) {
    return items
  }

  const aligned = new Map(
    entries.map((entry) => [
      entry.item.id,
      translateCanvasItemByDelta(
        entry.item,
        getAlignmentDelta(getItemBounds(entry.item), bounds, mode),
      ),
    ]),
  )

  return replaceCanvasChildrenAtPath(items, entries[0].parentPath, (children) =>
    children.map((child) => aligned.get(child.id) ?? child),
  )
}

export function distributeCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  mode: CanvasDistributeMode,
) {
  const entries = getSelectedSiblingEntries(items, ids, 3)

  if (!entries) {
    return items
  }

  const horizontal = mode === 'distributeHorizontal'
  const sorted = [...entries].sort((a, b) => {
    const aBounds = getItemBounds(a.item)
    const bBounds = getItemBounds(b.item)

    return horizontal ? aBounds.x - bBounds.x : aBounds.y - bBounds.y
  })
  const boundsList = sorted.map((entry) => getItemBounds(entry.item))
  const first = boundsList[0]
  const last = boundsList[boundsList.length - 1]
  const start = horizontal ? first.x : first.y
  const end = horizontal ? last.x + last.w : last.y + last.h
  const totalSize = boundsList.reduce(
    (sum, bounds) => sum + (horizontal ? bounds.w : bounds.h),
    0,
  )
  const gap = (end - start - totalSize) / (sorted.length - 1)
  let cursor = start
  const distributed = new Map<string, CanvasItem>()

  sorted.forEach((entry, index) => {
    const itemBounds = boundsList[index]
    const delta = horizontal
      ? { x: cursor - itemBounds.x, y: 0 }
      : { x: 0, y: cursor - itemBounds.y }

    distributed.set(entry.item.id, translateCanvasItemByDelta(entry.item, delta))
    cursor += (horizontal ? itemBounds.w : itemBounds.h) + gap
  })

  return replaceCanvasChildrenAtPath(items, entries[0].parentPath, (children) =>
    children.map((child) => distributed.get(child.id) ?? child),
  )
}

function getSelectedSiblingEntries(
  items: CanvasItem[],
  ids: string[],
  minCount: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))
  const entries = flattenCanvasItems(items).filter(
    (entry) => selected.has(entry.item.id) && !isCanvasItemLocked(entry.item),
  )
  const parentPath = entries[0]?.parentPath

  if (
    entries.length < minCount ||
    !parentPath ||
    !entries.every((entry) => sameCanvasPath(entry.parentPath, parentPath))
  ) {
    return null
  }

  return entries
}

function getAlignmentDelta(
  itemBounds: Bounds,
  bounds: Bounds,
  mode: CanvasAlignMode,
) {
  if (mode === 'alignLeft') {
    return { x: bounds.x - itemBounds.x, y: 0 }
  }

  if (mode === 'alignCenter') {
    return {
      x: bounds.x + bounds.w / 2 - (itemBounds.x + itemBounds.w / 2),
      y: 0,
    }
  }

  if (mode === 'alignRight') {
    return { x: bounds.x + bounds.w - (itemBounds.x + itemBounds.w), y: 0 }
  }

  if (mode === 'alignTop') {
    return { x: 0, y: bounds.y - itemBounds.y }
  }

  if (mode === 'alignMiddle') {
    return {
      x: 0,
      y: bounds.y + bounds.h / 2 - (itemBounds.y + itemBounds.h / 2),
    }
  }

  return { x: 0, y: bounds.y + bounds.h - (itemBounds.y + itemBounds.h) }
}

function translateCanvasItemByDelta(
  item: CanvasItem,
  delta: { x: number; y: number },
): CanvasItem {
  if (delta.x === 0 && delta.y === 0) {
    return item
  }

  if (item.type === 'group') {
    return syncGroupBounds({
      ...item,
      children: item.children.map((child) =>
        translateCanvasItemByDelta(child, delta),
      ),
    })
  }

  return {
    ...item,
    x: item.x + delta.x,
    y: item.y + delta.y,
  }
}
