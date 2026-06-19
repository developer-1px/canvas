export type CanvasSelectionListRangeInput<TId extends string = string> = {
  anchorId?: TId | null
  ids: readonly TId[]
  targetId?: TId | null
}

export type CanvasSelectionListModifierInput = {
  ctrlKey: boolean
  hasRangeAnchor?: boolean
  metaKey: boolean
  shiftKey: boolean
}

export type CanvasSelectionListSelectionMode = 'additive' | 'range' | 'replace'

export type CanvasSelectionListModifierState = {
  additive: boolean
  mode: CanvasSelectionListSelectionMode
  range: boolean
}

export type CanvasSelectionListSelectionPlanInput<
  TId extends string = string,
> = CanvasSelectionListModifierInput & {
  anchorId?: TId | null
  ids: readonly TId[]
  selectedIds: readonly TId[]
  targetId?: TId | null
}

export type CanvasSelectionListSelectionPlan<
  TId extends string = string,
> = {
  anchorId: TId | null
  mode: CanvasSelectionListSelectionMode
  selectedIds: TId[]
  targetId: TId | null
}

export function getCanvasSelectionListModifierState({
  ctrlKey,
  hasRangeAnchor = true,
  metaKey,
  shiftKey,
}: CanvasSelectionListModifierInput): CanvasSelectionListModifierState {
  const range = shiftKey && hasRangeAnchor
  const additive = !range && (metaKey || ctrlKey)

  return {
    additive,
    mode: range ? 'range' : additive ? 'additive' : 'replace',
    range,
  }
}

export function getCanvasSelectionListRangeIds<TId extends string>({
  anchorId,
  ids,
  targetId,
}: CanvasSelectionListRangeInput<TId>): TId[] {
  if (!targetId) {
    return []
  }

  const targetIndex = ids.indexOf(targetId)

  if (targetIndex < 0) {
    return []
  }

  if (!anchorId) {
    return [targetId]
  }

  const anchorIndex = ids.indexOf(anchorId)

  if (anchorIndex < 0) {
    return [targetId]
  }

  const start = Math.min(anchorIndex, targetIndex)
  const end = Math.max(anchorIndex, targetIndex)

  return [...ids.slice(start, end + 1)]
}

export function getCanvasSelectionListSelectionPlan<TId extends string>({
  anchorId,
  ctrlKey,
  ids,
  metaKey,
  selectedIds,
  shiftKey,
  targetId,
}: CanvasSelectionListSelectionPlanInput<TId>):
  CanvasSelectionListSelectionPlan<TId> {
  const validAnchorId = getCanvasSelectionListValidId({ id: anchorId, ids })
  const modifierState = getCanvasSelectionListModifierState({
    ctrlKey,
    hasRangeAnchor: validAnchorId !== null,
    metaKey,
    shiftKey,
  })
  const normalizedSelectedIds = getCanvasSelectionListOrderedIds({
    ids,
    selectedIds,
  })
  const validTargetId = getCanvasSelectionListValidId({ id: targetId, ids })

  if (validTargetId === null) {
    return {
      anchorId: validAnchorId,
      mode: modifierState.mode,
      selectedIds: normalizedSelectedIds,
      targetId: null,
    }
  }

  if (modifierState.mode === 'range' && validAnchorId !== null) {
    return {
      anchorId: validAnchorId,
      mode: 'range',
      selectedIds: getCanvasSelectionListRangeIds({
        anchorId: validAnchorId,
        ids,
        targetId: validTargetId,
      }),
      targetId: validTargetId,
    }
  }

  if (modifierState.mode === 'additive') {
    const nextSelectedIds = new Set(normalizedSelectedIds)

    if (nextSelectedIds.has(validTargetId)) {
      nextSelectedIds.delete(validTargetId)
    } else {
      nextSelectedIds.add(validTargetId)
    }

    return {
      anchorId: validTargetId,
      mode: 'additive',
      selectedIds: ids.filter((id) => nextSelectedIds.has(id)),
      targetId: validTargetId,
    }
  }

  return {
    anchorId: validTargetId,
    mode: 'replace',
    selectedIds: [validTargetId],
    targetId: validTargetId,
  }
}

function getCanvasSelectionListOrderedIds<TId extends string>({
  ids,
  selectedIds,
}: {
  ids: readonly TId[]
  selectedIds: readonly TId[]
}) {
  const selectedIdSet = new Set(selectedIds)

  return ids.filter((id) => selectedIdSet.has(id))
}

function getCanvasSelectionListValidId<TId extends string>({
  id,
  ids,
}: {
  id?: TId | null
  ids: readonly TId[]
}) {
  if (!id || !ids.includes(id)) {
    return null
  }

  return id
}
