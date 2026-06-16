export type CanvasSelectionListRangeInput<TId extends string = string> = {
  anchorId?: TId | null
  ids: readonly TId[]
  targetId?: TId | null
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
