import type { Bounds, CanvasItem } from './CanvasModel'
import { unique } from './CanvasModel'
import {
  boundsIntersect,
  findParentGroupId,
  findSelectedAncestorId,
  flattenCanvasItems,
  getItemBounds,
} from './CanvasTree'

export type CanvasItemPointerSelection = {
  alreadySelected: boolean
  dragItemId: string
  nextSelection: string[]
}

export function getCanvasItemPointerSelection({
  additive,
  itemId,
  items,
  selection,
}: {
  additive: boolean
  itemId: string
  items: CanvasItem[]
  selection: string[]
}): CanvasItemPointerSelection {
  const selectedAncestorId = findSelectedAncestorId(items, itemId, selection)
  const dragItemId = additive
    ? itemId
    : selectedAncestorId ?? findParentGroupId(items, itemId) ?? itemId
  const alreadySelected = selection.includes(itemId)
  const dragAlreadySelected = selection.includes(dragItemId)

  if (additive) {
    const parentGroupId = findParentGroupId(items, itemId)
    const baseSelection =
      parentGroupId && !alreadySelected
        ? selection.filter((id) => id !== parentGroupId)
        : selection

    return {
      alreadySelected,
      dragItemId,
      nextSelection: alreadySelected
        ? selection.filter((id) => id !== itemId)
        : unique([...baseSelection, itemId]),
    }
  }

  return {
    alreadySelected,
    dragItemId,
    nextSelection: dragAlreadySelected ? selection : [dragItemId],
  }
}

export function getCanvasMarqueeSelection({
  additive,
  baseSelection,
  bounds,
  items,
}: {
  additive: boolean
  baseSelection: string[]
  bounds: Bounds
  items: CanvasItem[]
}) {
  const hitIds = unique(
    flattenCanvasItems(items)
      .filter((entry) => boundsIntersect(bounds, getItemBounds(entry.item)))
      .map((entry) => findParentGroupId(items, entry.item.id) ?? entry.item.id),
  )

  return additive ? unique([...baseSelection, ...hitIds]) : hitIds
}
