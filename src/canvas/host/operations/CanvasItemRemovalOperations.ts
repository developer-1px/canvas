import type { CanvasItem } from '../CanvasModel'
import { syncGroupBounds } from '../CanvasTree'

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
