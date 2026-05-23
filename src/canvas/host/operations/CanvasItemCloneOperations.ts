import type { Point } from '../../core'
import type {
  CanvasItem,
  GroupItem,
} from '../model'
import {
  isCanvasDrawingItem,
  translateCanvasDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
import {
  flattenCanvasItems,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export function copyCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return flattenCanvasItems(items)
    .filter((entry) => selected.has(entry.item.id))
    .map((entry) => cloneCanvasItemTree(entry.item))
}

export function cloneCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  createId: (prefix: string) => string,
  offset: Point,
) {
  return cloneCanvasItemsWithNewIds(
    copyCanvasSelection(items, ids),
    createId,
    offset,
  )
}

export function cloneCanvasItemsWithNewIds(
  items: CanvasItem[],
  createId: (prefix: string) => string,
  offset: Point,
) {
  return items.map((item) => cloneCanvasItemWithNewId(item, createId, offset))
}

function cloneCanvasItemTree(item: CanvasItem): CanvasItem {
  if (isCanvasGroupItem(item)) {
    return {
      ...item,
      children: item.children.map(cloneCanvasItemTree),
    }
  }

  return { ...item }
}

function cloneCanvasItemWithNewId(
  item: CanvasItem,
  createId: (prefix: string) => string,
  offset: Point,
): CanvasItem {
  if (isCanvasGroupItem(item)) {
    const group: GroupItem = {
      ...item,
      id: createId('group'),
      children: item.children.map((child) =>
        cloneCanvasItemWithNewId(child, createId, offset),
      ),
    }

    return syncGroupBounds(group)
  }

  if (isCanvasDrawingItem(item)) {
    return translateCanvasDrawingItem({
      dx: offset.x,
      dy: offset.y,
      item: {
        ...item,
        id: createId(item.type),
      },
    })
  }

  return {
    ...item,
    id: createId(item.type),
    x: item.x + offset.x,
    y: item.y + offset.y,
  }
}
