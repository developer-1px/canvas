import type { CanvasItem } from '../model'
import { pruneNestedSelection, syncGroupBounds } from '../tree/CanvasTree'
import { mapCanvasItems } from './CanvasItemOperationTree'

export function isCanvasItemLocked(item: CanvasItem) {
  return item.locked === true
}

export function lockCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return {
    items: mapCanvasItems(items, (item) =>
      selected.has(item.id) ? setCanvasItemLocked(item, true) : item,
    ),
    selection: ids.filter((id) => !selected.has(id)),
  }
}

export function unlockAllCanvasItems(items: CanvasItem[]): CanvasItem[] {
  return items.map((item) => {
    const unlocked = setCanvasItemLocked(item, false)

    if (unlocked.type !== 'group') {
      return unlocked
    }

    return syncGroupBounds({
      ...unlocked,
      children: unlockAllCanvasItems(unlocked.children),
    })
  })
}

function setCanvasItemLocked(item: CanvasItem, locked: boolean): CanvasItem {
  if (locked) {
    return {
      ...item,
      locked: true,
    }
  }

  const unlocked = { ...item }
  delete unlocked.locked
  return unlocked
}
