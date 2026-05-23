import type { Point } from '../../core'
import type {
  CanvasItem,
  GroupItem
} from '../model'
import {
  flattenCanvasItems,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'

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
  if (item.type === 'group') {
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
  if (item.type === 'group') {
    const group: GroupItem = {
      ...item,
      id: createId('group'),
      children: item.children.map((child) =>
        cloneCanvasItemWithNewId(child, createId, offset),
      ),
    }

    return syncGroupBounds(group)
  }

  if (item.type === 'arrow') {
    return {
      ...item,
      id: createId(item.type),
      x: item.x + offset.x,
      y: item.y + offset.y,
      start: {
        x: item.start.x + offset.x,
        y: item.start.y + offset.y,
      },
      end: {
        x: item.end.x + offset.x,
        y: item.end.y + offset.y,
      },
    }
  }

  return {
    ...item,
    id: createId(item.type),
    x: item.x + offset.x,
    y: item.y + offset.y,
  }
}
