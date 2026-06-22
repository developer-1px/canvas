import type { CanvasItem } from '../../entities'

export function replaceSelectedCanvasAppItems(
  items: CanvasItem[],
  selectedIds: ReadonlySet<string>,
  replaceItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return replaceCanvasAppItemsByIds(items, selectedIds, replaceItem)
}

export function replaceCanvasAppItemsByIds(
  items: CanvasItem[],
  targetIds: ReadonlySet<string>,
  replaceItem: (item: CanvasItem) => CanvasItem,
): CanvasItem[] {
  return items.map((item) => {
    const nextItem = targetIds.has(item.id) ? replaceItem(item) : item

    return nextItem.type === 'group'
      ? {
          ...nextItem,
          children: replaceCanvasAppItemsByIds(
            nextItem.children,
            targetIds,
            replaceItem,
          ),
        }
      : nextItem
  })
}

export function setCanvasAppItemHidden(
  item: CanvasItem,
  hidden: boolean,
): CanvasItem {
  if (hidden) {
    return { ...item, hidden: true }
  }

  const nextItem = { ...item }
  delete nextItem.hidden
  return nextItem
}

export function setCanvasAppItemLocked(
  item: CanvasItem,
  locked: boolean,
): CanvasItem {
  if (locked) {
    return { ...item, locked: true }
  }

  const nextItem = { ...item }
  delete nextItem.locked
  return nextItem
}
