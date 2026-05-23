import type {
  CanvasItem,
  GroupItem,
} from '../model'

export type CanvasGroupItem = GroupItem

export function isCanvasGroupItem(item: CanvasItem): item is GroupItem {
  return item.type === 'group'
}

export function isCanvasGroupItemStorageShape(
  value: Record<string, unknown>,
  isCanvasItem: (value: unknown) => value is CanvasItem,
): value is GroupItem {
  return (
    value.type === 'group' &&
    Array.isArray(value.children) &&
    value.children.every(isCanvasItem)
  )
}
