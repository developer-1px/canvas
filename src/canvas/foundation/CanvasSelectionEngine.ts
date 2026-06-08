import type { Bounds } from '../core'
import { unique } from '../core'
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
        ? pruneCanvasSceneSelection({
            scene,
            selection: selection.filter((id) => id !== itemId),
          })
        : pruneCanvasSceneSelection({
            scene,
            selection: unique([...baseSelection, itemId]),
          }),
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

  return pruneCanvasSceneSelection({
    scene,
    selection: additive ? unique([...baseSelection, ...hitIds]) : hitIds,
  })
}

function pruneCanvasSceneSelection({
  scene,
  selection,
}: {
  scene: CanvasSceneAdapter
  selection: string[]
}) {
  const entries = scene.entries
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const selected = new Set(selection)

  return unique(selection).filter((id) => {
    const entry = byId.get(id)

    if (!entry) {
      return true
    }

    return !entries.some(
      (candidate) =>
        candidate.isGroup &&
        selected.has(candidate.id) &&
        isAncestorPath(candidate.path, entry.path),
    )
  })
}

function boundsIntersect(a: Bounds, b: Bounds) {
  return (
    a.x <= b.x + b.w &&
    a.x + a.w >= b.x &&
    a.y <= b.y + b.h &&
    a.y + a.h >= b.y
  )
}

function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}
