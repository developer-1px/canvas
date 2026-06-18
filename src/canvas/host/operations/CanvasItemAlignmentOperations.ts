import {
  distributeCanvasRectList,
  getCanvasAlignmentDelta,
  type CanvasAlignMode,
  type CanvasDistributeMode,
} from '../../foundation'
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

export type CanvasTidyOptions = {
  gap?: number
}

export type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from '../../foundation'

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
        getCanvasAlignmentDelta({
          bounds: getItemBounds(entry.item),
          frame: bounds,
          mode,
        }),
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

  const plans = distributeCanvasRectList({
    entries: entries.map((entry) => ({
      bounds: getItemBounds(entry.item),
      id: entry.item.id,
    })),
    mode,
  })
  const planById = new Map(plans.map((plan) => [plan.id, plan]))
  const distributed = new Map<string, CanvasItem>()

  entries.forEach((entry) => {
    const plan = planById.get(entry.item.id)

    if (!plan) {
      return
    }

    distributed.set(
      entry.item.id,
      translateCanvasItemByDelta(entry.item, plan.delta),
    )
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
