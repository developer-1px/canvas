import type { Bounds } from '../../core'
import type { CanvasItem } from '../model'
import {
  flattenCanvasItems,
  getItemBounds,
  getItemsBounds,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import {
  isCanvasDrawingItem,
  translateCanvasDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
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

export type CanvasTidyOptions = {
  gap?: number
}

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

export function canTidyCanvasSelection(items: CanvasItem[], ids: string[]) {
  return getSelectedTidyEntries(items, ids) !== null
}

export function tidyCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  options: CanvasTidyOptions = {},
) {
  const entries = getSelectedTidyEntries(items, ids)

  if (!entries) {
    return items
  }

  const gap = options.gap ?? 24
  const boundsList = entries.map((entry) => getItemBounds(entry.item))
  const bounds = getItemsBounds(entries.map((entry) => entry.item))

  if (!bounds) {
    return items
  }

  const columnCount = Math.ceil(Math.sqrt(entries.length))
  const cellWidth = Math.max(...boundsList.map((item) => item.w)) + gap
  const cellHeight = Math.max(...boundsList.map((item) => item.h)) + gap
  const sorted = [...entries].sort((a, b) => {
    const aBounds = getItemBounds(a.item)
    const bBounds = getItemBounds(b.item)

    return aBounds.y === bBounds.y
      ? aBounds.x - bBounds.x
      : aBounds.y - bBounds.y
  })
  const tidied = new Map<string, CanvasItem>()

  sorted.forEach((entry, index) => {
    const itemBounds = getItemBounds(entry.item)
    const column = index % columnCount
    const row = Math.floor(index / columnCount)
    const target = {
      x: bounds.x + column * cellWidth,
      y: bounds.y + row * cellHeight,
    }

    tidied.set(entry.item.id, translateCanvasItemByDelta(entry.item, {
      x: target.x - itemBounds.x,
      y: target.y - itemBounds.y,
    }))
  })

  return replaceCanvasChildrenAtPath(items, entries[0].parentPath, (children) =>
    children.map((child) => tidied.get(child.id) ?? child),
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

function getSelectedTidyEntries(items: CanvasItem[], ids: string[]) {
  const selected = new Set(pruneNestedSelection(items, ids))
  const entries = flattenCanvasItems(items).filter(
    (entry) =>
      selected.has(entry.item.id) &&
      !isCanvasItemLocked(entry.item) &&
      isTidyCanvasItem(entry.item),
  )
  const parentPath = entries[0]?.parentPath

  if (
    entries.length < 3 ||
    !parentPath ||
    !entries.every((entry) => sameCanvasPath(entry.parentPath, parentPath))
  ) {
    return null
  }

  return entries
}

function isTidyCanvasItem(item: CanvasItem) {
  return !isCanvasDrawingItem(item)
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

  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      children: item.children.map((child) =>
        translateCanvasItemByDelta(child, delta),
      ),
    })
  }

  if (isCanvasDrawingItem(item)) {
    return translateCanvasDrawingItem({
      dx: delta.x,
      dy: delta.y,
      item,
    })
  }

  return {
    ...item,
    x: item.x + delta.x,
    y: item.y + delta.y,
  }
}
