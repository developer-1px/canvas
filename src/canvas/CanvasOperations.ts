import {
  scaleItemBounds,
  unique,
  type Bounds,
  type Point,
} from './CanvasPrimitives'
import type {
  CanvasItem,
  GroupItem,
} from './CanvasModel'
import {
  flattenCanvasItems,
  getItemBounds,
  pruneNestedSelection,
  syncCanvasItems,
  syncGroupBounds,
} from './CanvasTree'

export function translateCanvasItems(
  items: CanvasItem[],
  ids: string[],
  dx: number,
  dy: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return mapCanvasItems(items, (item) =>
    selected.has(item.id) ? translateCanvasItem(item, dx, dy) : item,
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
    selected.has(item.id) ? scaleCanvasItem(item, from, to) : item,
  )
}

export function removeCanvasItems(items: CanvasItem[], ids: string[]) {
  const selected = new Set(ids)

  return items.flatMap((item): CanvasItem[] => {
    if (selected.has(item.id)) {
      return []
    }

    if (item.type !== 'group') {
      return [item]
    }

    const children = removeCanvasItems(item.children, ids)

    return children.length > 0
      ? [syncGroupBounds({ ...item, children })]
      : []
  })
}

export function updateTextItem(
  items: CanvasItem[],
  id: string,
  text: string,
) {
  return mapCanvasItems(items, (item) =>
    item.id === id && item.type === 'text' ? { ...item, text } : item,
  )
}

export function updateItemText(
  items: CanvasItem[],
  id: string,
  text: string,
) {
  return mapCanvasItems(items, (item) =>
    item.id === id && (item.type === 'rect' || item.type === 'text')
      ? { ...item, text }
      : item,
  )
}

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

export function groupCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  groupId: string,
) {
  const selectedIds = pruneNestedSelection(items, ids)

  if (selectedIds.length < 2) {
    return { items, selection: ids }
  }

  const selected = new Set(selectedIds)
  const entries = flattenCanvasItems(items).filter((entry) =>
    selected.has(entry.item.id),
  )
  const parentPath = entries[0]?.parentPath

  if (
    !parentPath ||
    !entries.every((entry) => samePath(entry.parentPath, parentPath))
  ) {
    return { items, selection: ids }
  }

  const minIndex = Math.min(...entries.map((entry) => entry.index))
  const nextItems = replaceChildrenAtPath(items, parentPath, (children) => {
    const grouped = children.filter((child) => selected.has(child.id))
    const rest = children.filter((child) => !selected.has(child.id))
    const insertIndex = children
      .slice(0, minIndex)
      .filter((child) => !selected.has(child.id)).length
    const group = syncGroupBounds({
      id: groupId,
      type: 'group',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      children: grouped,
    })

    return [...rest.slice(0, insertIndex), group, ...rest.slice(insertIndex)]
  })

  return { items: syncCanvasItems(nextItems), selection: [groupId] }
}

export function ungroupCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = new Set(ids)
  const nextSelection: string[] = []

  function visit(nodes: CanvasItem[]): CanvasItem[] {
    return nodes.flatMap((item): CanvasItem[] => {
      if (item.type === 'group' && selected.has(item.id)) {
        nextSelection.push(...item.children.map((child) => child.id))
        return item.children
      }

      if (item.type !== 'group') {
        return [item]
      }

      const children = visit(item.children)

      return children.length > 0
        ? [syncGroupBounds({ ...item, children })]
        : []
    })
  }

  const nextItems = syncCanvasItems(visit(items))
  return {
    items: nextItems,
    selection: unique(nextSelection),
  }
}

function mapCanvasItems(
  items: CanvasItem[],
  mapItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return items.map((item) => {
    if (item.type !== 'group') {
      return mapItem(item)
    }

    const mappedGroup = mapItem(item)

    if (mappedGroup.type !== 'group' || mappedGroup !== item) {
      return mappedGroup
    }

    return syncGroupBounds({
      ...item,
      children: mapCanvasItems(item.children, mapItem),
    })
  })
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

  return {
    ...item,
    ...scaleItemBounds(getItemBounds(item), from, to),
  }
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

  return {
    ...item,
    id: createId(item.type),
    x: item.x + offset.x,
    y: item.y + offset.y,
  }
}

function replaceChildrenAtPath(
  items: CanvasItem[],
  path: number[],
  update: (children: CanvasItem[]) => CanvasItem[],
): CanvasItem[] {
  if (path.length === 0) {
    return update(items)
  }

  const [head, ...tail] = path

  return items.map((item, index) => {
    if (index !== head || item.type !== 'group') {
      return item
    }

    return syncGroupBounds({
      ...item,
      children: replaceChildrenAtPath(item.children, tail, update),
    })
  })
}

function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
