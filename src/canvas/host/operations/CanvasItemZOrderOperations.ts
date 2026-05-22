import type { CanvasItem } from '../model'
import { pruneNestedSelection, syncGroupBounds } from '../tree/CanvasTree'

export type CanvasZOrderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export function reorderCanvasItems(
  items: CanvasItem[],
  ids: string[],
  mode: CanvasZOrderMode,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  if (selected.size === 0) {
    return items
  }

  return reorderCanvasItemTree(items, selected, mode)
}

function reorderCanvasItemTree(
  items: CanvasItem[],
  selected: Set<string>,
  mode: CanvasZOrderMode,
): CanvasItem[] {
  return reorderCanvasSiblings(items, selected, mode).map((item) => {
    if (item.type !== 'group') {
      return item
    }

    return syncGroupBounds({
      ...item,
      children: reorderCanvasItemTree(item.children, selected, mode),
    })
  })
}

function reorderCanvasSiblings(
  items: CanvasItem[],
  selected: Set<string>,
  mode: CanvasZOrderMode,
) {
  if (!items.some((item) => selected.has(item.id))) {
    return items
  }

  if (mode === 'bringToFront') {
    return [
      ...items.filter((item) => !selected.has(item.id)),
      ...items.filter((item) => selected.has(item.id)),
    ]
  }

  if (mode === 'sendToBack') {
    return [
      ...items.filter((item) => selected.has(item.id)),
      ...items.filter((item) => !selected.has(item.id)),
    ]
  }

  const next = [...items]

  if (mode === 'bringForward') {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      if (selected.has(next[index].id) && !selected.has(next[index + 1].id)) {
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      }
    }
  } else {
    for (let index = 1; index < next.length; index += 1) {
      if (selected.has(next[index].id) && !selected.has(next[index - 1].id)) {
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      }
    }
  }

  return next
}
