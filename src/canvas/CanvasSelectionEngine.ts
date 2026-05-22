import type { Bounds } from './CanvasModel'
import { unique } from './CanvasModel'
import type { CanvasSceneAdapter } from './CanvasSceneAdapter'

export type CanvasItemPointerSelection = {
  alreadySelected: boolean
  dragItemId: string
  nextSelection: string[]
}

export function getCanvasItemPointerSelection({
  additive,
  itemId,
  scene,
  selection,
}: {
  additive: boolean
  itemId: string
  scene: CanvasSceneAdapter
  selection: string[]
}): CanvasItemPointerSelection {
  const selectedAncestorId = scene.getSelectedAncestorId(itemId, selection)
  const dragItemId = additive
    ? itemId
    : selectedAncestorId ?? scene.getParentId(itemId) ?? itemId
  const alreadySelected = selection.includes(itemId)
  const dragAlreadySelected = selection.includes(dragItemId)

  if (additive) {
    const parentGroupId = scene.getParentId(itemId)
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
  scene,
}: {
  additive: boolean
  baseSelection: string[]
  bounds: Bounds
  scene: CanvasSceneAdapter
}) {
  const hitIds = unique(
    scene.entries
      .filter((entry) => boundsIntersect(bounds, entry.bounds))
      .map((entry) => scene.getParentId(entry.id) ?? entry.id),
  )

  return additive ? unique([...baseSelection, ...hitIds]) : hitIds
}

function boundsIntersect(a: Bounds, b: Bounds) {
  return (
    a.x <= b.x + b.w &&
    a.x + a.w >= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  )
}
