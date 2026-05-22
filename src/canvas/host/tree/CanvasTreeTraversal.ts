import type { CanvasItem, RectItem, TextItem } from '../model/CanvasModel'
import { samePath } from './CanvasTreePath'

export type CanvasItemEntry = {
  item: CanvasItem
  path: number[]
  parentPath: number[]
  index: number
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
