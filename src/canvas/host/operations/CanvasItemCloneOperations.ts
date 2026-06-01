import type { Point } from '../../core'
import type {
  CanvasCommentItem,
  CanvasItem,
  GroupItem,
} from '../model'
import { isCanvasCommentItem } from '../comment/CanvasCommentItem'
import {
  isCanvasDrawingItem,
  translateCanvasDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
import {
  flattenCanvasItems,
  pruneNestedSelection,
  syncCanvasItems,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { replaceCanvasChildrenAtPath } from './CanvasItemOperationTree'

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

export function duplicateCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  createId: (prefix: string) => string,
  offset: Point,
) {
  const selected = new Set(pruneNestedSelection(items, ids))
  const selectedEntries = flattenCanvasItems(items).filter((entry) =>
    selected.has(entry.item.id),
  )
  const clones: CanvasItem[] = []
  const groups = new Map<
    string,
    {
      entries: { clone: CanvasItem; index: number }[]
      parentPath: number[]
    }
  >()

  for (const entry of selectedEntries) {
    const clone = cloneCanvasItemWithNewId(entry.item, createId, offset)
    const parentPath = entry.path.slice(0, -1)
    const key = parentPath.join('/')
    const group = groups.get(key) ?? { entries: [], parentPath }

    group.entries.push({
      clone,
      index: entry.path[entry.path.length - 1] ?? 0,
    })
    groups.set(key, group)
    clones.push(clone)
  }

  const nextItems = [...groups.values()]
    .sort((a, b) => b.parentPath.length - a.parentPath.length)
    .reduce((currentItems, group) =>
      replaceCanvasChildrenAtPath(currentItems, group.parentPath, (children) => {
        const insertIndex = Math.max(
          ...group.entries.map((entry) => entry.index),
        ) + 1

        return [
          ...children.slice(0, insertIndex),
          ...group.entries
            .sort((a, b) => a.index - b.index)
            .map((entry) => entry.clone),
          ...children.slice(insertIndex),
        ]
      }), items)

  return {
    clones,
    items: syncCanvasItems(nextItems),
    selection: clones.map((item) => item.id),
  }
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

  const id = createId(item.type)
  const clone = {
    ...item,
    id,
    x: item.x + offset.x,
    y: item.y + offset.y,
  }

  return isCanvasCommentItem(clone)
    ? cloneCanvasCommentItemThreadIds(clone)
    : clone
}

function cloneCanvasCommentItemThreadIds(
  item: CanvasCommentItem,
): CanvasCommentItem {
  if (!item.thread) {
    return item
  }

  return {
    ...item,
    thread: item.thread.map((message, index) => ({
      ...message,
      id: `${item.id}:message-${index + 1}`,
    })),
  }
}
