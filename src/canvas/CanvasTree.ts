import { unique, type Bounds } from './CanvasPrimitives'
import type { CanvasItem, GroupItem, RectItem, TextItem } from './CanvasModel'

export type CanvasItemEntry = {
  item: CanvasItem
  path: number[]
  parentPath: number[]
  index: number
}

export function boundsIntersect(a: Bounds, b: Bounds) {
  return (
    a.x <= b.x + b.w &&
    a.x + a.w >= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  )
}

export function getItemBounds(item: CanvasItem): Bounds {
  if (item.type === 'group') {
    return getItemsBounds(item.children) ?? {
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }
  }

  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }
}

export function getItemsBounds(items: CanvasItem[]) {
  if (items.length === 0) {
    return null
  }

  const first = getItemBounds(items[0])
  let minX = first.x
  let minY = first.y
  let maxX = first.x + first.w
  let maxY = first.y + first.h

  for (const item of items.slice(1)) {
    const bounds = getItemBounds(item)
    minX = Math.min(minX, bounds.x)
    minY = Math.min(minY, bounds.y)
    maxX = Math.max(maxX, bounds.x + bounds.w)
    maxY = Math.max(maxY, bounds.y + bounds.h)
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

export function syncGroupBounds(group: GroupItem): GroupItem {
  const bounds = getItemsBounds(group.children)

  return bounds ? { ...group, ...bounds } : group
}

export function syncCanvasItems(items: CanvasItem[]): CanvasItem[] {
  return items.map((item) => {
    if (item.type !== 'group') {
      return item
    }

    return syncGroupBounds({
      ...item,
      children: syncCanvasItems(item.children),
    })
  })
}

export function flattenCanvasItems(items: CanvasItem[]) {
  const entries: CanvasItemEntry[] = []

  function visit(nodes: CanvasItem[], parentPath: number[]) {
    nodes.forEach((item, index) => {
      const path = [...parentPath, index]
      entries.push({ item, path, parentPath, index })

      if (item.type === 'group') {
        visit(item.children, path)
      }
    })
  }

  visit(items, [])
  return entries
}

export function findCanvasItem(items: CanvasItem[], id: string) {
  return findCanvasItemEntry(items, id)?.item
}

export function findCanvasItemEntry(items: CanvasItem[], id: string) {
  return flattenCanvasItems(items).find((entry) => entry.item.id === id)
}

export function findParentGroupId(items: CanvasItem[], id: string) {
  const entries = flattenCanvasItems(items)
  const entry = entries.find((candidate) => candidate.item.id === id)

  if (!entry || entry.parentPath.length === 0) {
    return null
  }

  return (
    entries.find(
      (candidate) =>
        candidate.item.type === 'group' &&
        samePath(candidate.path, entry.parentPath),
    )?.item.id ?? null
  )
}

export function findSelectedAncestorId(
  items: CanvasItem[],
  id: string,
  selectedIds: string[],
) {
  const entries = flattenCanvasItems(items)
  const entry = entries.find((candidate) => candidate.item.id === id)
  const selected = new Set(selectedIds)

  if (!entry) {
    return null
  }

  const ancestors = entries
    .filter(
      (candidate) =>
        selected.has(candidate.item.id) &&
        (samePath(candidate.path, entry.path) ||
          isAncestorPath(candidate.path, entry.path)),
    )
    .sort((a, b) => a.path.length - b.path.length)

  return ancestors[0]?.item.id ?? null
}

export function findTextItem(items: CanvasItem[], id: string): TextItem | null {
  const item = findCanvasItem(items, id)

  return item?.type === 'text' ? item : null
}

export function findEditableTextItem(
  items: CanvasItem[],
  id: string,
): RectItem | TextItem | null {
  const item = findCanvasItem(items, id)

  return item?.type === 'rect' || item?.type === 'text' ? item : null
}

export function unionBounds(items: CanvasItem[], selected: Set<string>) {
  return getItemsBounds(
    flattenCanvasItems(items)
      .filter((entry) => selected.has(entry.item.id))
      .map((entry) => entry.item),
  )
}

export function pruneNestedSelection(items: CanvasItem[], ids: string[]) {
  const entries = flattenCanvasItems(items)
  const byId = new Map(entries.map((entry) => [entry.item.id, entry]))
  const selected = new Set(ids)

  return unique(ids).filter((id) => {
    const entry = byId.get(id)

    if (!entry) {
      return false
    }

    return !entries.some(
      (candidate) =>
        candidate.item.type === 'group' &&
        selected.has(candidate.item.id) &&
        isAncestorPath(candidate.path, entry.path),
    )
  })
}

function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}

function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
