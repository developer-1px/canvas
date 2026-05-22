import type { CanvasItem } from '../CanvasModel'
import { syncGroupBounds } from '../CanvasTree'

export function mapCanvasItems(
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

export function replaceCanvasChildrenAtPath(
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
      children: replaceCanvasChildrenAtPath(item.children, tail, update),
    })
  })
}

export function sameCanvasPath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
