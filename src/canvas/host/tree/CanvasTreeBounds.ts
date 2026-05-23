import type { Bounds } from '../../core'
import type {
  CanvasItem,
  GroupItem,
} from '../model'
import {
  getCanvasDrawingItemBounds,
  isCanvasDrawingItem,
  syncCanvasDrawingItemBounds,
} from '../drawing/CanvasDrawingItemGeometry'

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

  if (isCanvasDrawingItem(item)) {
    return getCanvasDrawingItemBounds(item)
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

export function syncCanvasItemBounds<TItem extends CanvasItem>(
  item: TItem,
): TItem {
  if (item.type === 'group') {
    return syncGroupBounds(item) as TItem
  }

  if (isCanvasDrawingItem(item)) {
    return syncCanvasDrawingItemBounds(item) as TItem
  }

  return item
}

export function syncCanvasItems(items: CanvasItem[]): CanvasItem[] {
  return items.map((item) => {
    if (item.type === 'group') {
      return syncCanvasItemBounds({
        ...item,
        children: syncCanvasItems(item.children),
      })
    }

    return syncCanvasItemBounds(item)
  })
}
