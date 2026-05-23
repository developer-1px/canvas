import type { CanvasItem } from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { syncGroupBounds } from '../tree/CanvasTree'

export function mapCanvasItems(
  items: CanvasItem[],
  mapItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return items.map((item) => {
    if (!isCanvasGroupItem(item)) {
      return mapItem(item)
    }

    const mappedGroup = mapItem(item)

    if (!isCanvasGroupItem(mappedGroup) || mappedGroup !== item) {
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
    if (index !== head || !isCanvasGroupItem(item)) {
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
