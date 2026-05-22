import type { CanvasItem } from '../model/CanvasModel'
import { syncGroupBounds } from '../tree/CanvasTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'

export function removeCanvasItems(items: CanvasItem[], ids: string[]) {
  const selected = new Set(ids)

  return items.flatMap((item): CanvasItem[] => {
    if (isCanvasItemLocked(item)) {
      return [item]
    }

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
