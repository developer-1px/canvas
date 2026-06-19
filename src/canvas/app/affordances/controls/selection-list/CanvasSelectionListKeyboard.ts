import {
  getCanvasSelectionListSelectionPlan,
  type CanvasSelectionListSelectionPlan,
} from './CanvasSelectionListRange'

export type CanvasSelectionListKeyboardIntentInput<
  TId extends string = string,
> = {
  anchorId?: TId | null
  ctrlKey: boolean
  focusedId?: TId | null
  ids: readonly TId[]
  key: string
  metaKey: boolean
  selectedIds: readonly TId[]
  shiftKey: boolean
}

export type CanvasSelectionListKeyboardIntent<
  TId extends string = string,
> =
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }
  | {
      focusId: TId
      index: number
      kind: 'move-focus'
      preventDefault: true
      selectionPlan: CanvasSelectionListSelectionPlan<TId> | null
      stopPropagation: true
    }
  | {
      focusId: TId
      index: number
      kind: 'select-focused'
      preventDefault: true
      selectionPlan: CanvasSelectionListSelectionPlan<TId>
      stopPropagation: true
    }

export type CanvasSelectionListKeyboardEvent = {
  ctrlKey: boolean
  key: string
  metaKey: boolean
  preventDefault: () => void
  shiftKey: boolean
  stopPropagation: () => void
}

export type RunCanvasSelectionListKeyboardIntentInput<
  TId extends string = string,
> = Omit<
  CanvasSelectionListKeyboardIntentInput<TId>,
  'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
> & {
  event: CanvasSelectionListKeyboardEvent
  onFocusItem: (id: TId, index: number) => void
  onSelectionPlan: (plan: CanvasSelectionListSelectionPlan<TId>) => void
}

export function getCanvasSelectionListKeyboardIntent<TId extends string>({
  anchorId,
  ctrlKey,
  focusedId,
  ids,
  key,
  metaKey,
  selectedIds,
  shiftKey,
}: CanvasSelectionListKeyboardIntentInput<TId>):
  CanvasSelectionListKeyboardIntent<TId> {
  if (ids.length === 0) {
    return getCanvasSelectionListNoneKeyboardIntent()
  }

  const focusedIndex = getCanvasSelectionListFocusedIndex({ focusedId, ids })
  const nextFocusIndex = getCanvasSelectionListKeyboardFocusIndex({
    count: ids.length,
    currentIndex: focusedIndex,
    key,
  })

  if (nextFocusIndex !== null) {
    const nextFocusId = ids[nextFocusIndex]
    const selectionPlan = shiftKey
      ? getCanvasSelectionListSelectionPlan({
        anchorId,
        ctrlKey,
        ids,
        metaKey,
        selectedIds,
        shiftKey,
        targetId: nextFocusId,
      })
      : null

    return {
      focusId: nextFocusId,
      index: nextFocusIndex,
      kind: 'move-focus',
      preventDefault: true,
      selectionPlan,
      stopPropagation: true,
    }
  }

  if (key !== 'Enter' && key !== ' ') {
    return getCanvasSelectionListNoneKeyboardIntent()
  }

  if (focusedIndex < 0) {
    return getCanvasSelectionListNoneKeyboardIntent()
  }

  const focusedItemId = ids[focusedIndex]

  return {
    focusId: focusedItemId,
    index: focusedIndex,
    kind: 'select-focused',
    preventDefault: true,
    selectionPlan: getCanvasSelectionListSelectionPlan({
      anchorId,
      ctrlKey,
      ids,
      metaKey,
      selectedIds,
      shiftKey,
      targetId: focusedItemId,
    }),
    stopPropagation: true,
  }
}

export function runCanvasSelectionListKeyboardIntent<TId extends string>({
  anchorId,
  event,
  focusedId,
  ids,
  onFocusItem,
  onSelectionPlan,
  selectedIds,
}: RunCanvasSelectionListKeyboardIntentInput<TId>) {
  const intent = getCanvasSelectionListKeyboardIntent({
    anchorId,
    ctrlKey: event.ctrlKey,
    focusedId,
    ids,
    key: event.key,
    metaKey: event.metaKey,
    selectedIds,
    shiftKey: event.shiftKey,
  })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }

  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  onFocusItem(intent.focusId, intent.index)

  if (intent.selectionPlan) {
    onSelectionPlan(intent.selectionPlan)
  }

  return true
}

function getCanvasSelectionListNoneKeyboardIntent():
  CanvasSelectionListKeyboardIntent<never> {
  return {
    kind: 'none',
    preventDefault: false,
    stopPropagation: false,
  }
}

function getCanvasSelectionListFocusedIndex<TId extends string>({
  focusedId,
  ids,
}: {
  focusedId?: TId | null
  ids: readonly TId[]
}) {
  if (!focusedId) {
    return -1
  }

  return ids.indexOf(focusedId)
}

function getCanvasSelectionListKeyboardFocusIndex({
  count,
  currentIndex,
  key,
}: {
  count: number
  currentIndex: number
  key: string
}) {
  if (count === 0) {
    return null
  }

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return currentIndex < 0 ? 0 : Math.min(currentIndex + 1, count - 1)
  }

  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return currentIndex < 0 ? count - 1 : Math.max(currentIndex - 1, 0)
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return count - 1
  }

  return null
}
