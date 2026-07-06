import {
  isCanvasKeyboardTypingTarget,
} from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardSelectionCycleDirection = 'next' | 'previous'

export type CanvasKeyboardSelectionCycleIntent =
  | {
      direction: CanvasKeyboardSelectionCycleDirection
      kind: 'cycle-selection'
      preventDefault: true
      selection: readonly string[]
    }
  | { kind: 'none'; preventDefault: false }

export type CanvasKeyboardSelectionCycleInput = {
  event: Pick<
    globalThis.KeyboardEvent,
    'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey' | 'target'
  >
  isSuppressedTarget?: (target: EventTarget | null) => boolean
  selectableIds: readonly string[]
  selection: readonly string[]
}

export type CanvasSelectionCycleInput = {
  direction: CanvasKeyboardSelectionCycleDirection
  selectableIds: readonly string[]
  selection: readonly string[]
}

export function getCanvasKeyboardSelectionCycleIntent({
  event,
  isSuppressedTarget = isCanvasKeyboardTypingTarget,
  selectableIds,
  selection,
}: CanvasKeyboardSelectionCycleInput): CanvasKeyboardSelectionCycleIntent {
  if (
    event.key !== 'Tab' ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isSuppressedTarget(event.target)
  ) {
    return { kind: 'none', preventDefault: false }
  }

  const direction = event.shiftKey ? 'previous' : 'next'
  const nextSelection = getCanvasSelectionCycleResult({
    direction,
    selectableIds,
    selection,
  })

  return nextSelection.length === 0
    ? { kind: 'none', preventDefault: false }
    : {
        direction,
        kind: 'cycle-selection',
        preventDefault: true,
        selection: nextSelection,
      }
}

export function getCanvasSelectionCycleResult({
  direction,
  selectableIds,
  selection,
}: CanvasSelectionCycleInput): readonly string[] {
  if (selectableIds.length === 0) {
    return []
  }

  const anchorId = selection.find((id) => selectableIds.includes(id))

  if (anchorId === undefined) {
    return [
      direction === 'previous'
        ? selectableIds[selectableIds.length - 1]!
        : selectableIds[0]!,
    ]
  }

  const anchorIndex = selectableIds.indexOf(anchorId)
  const offset = direction === 'previous' ? -1 : 1
  const nextIndex =
    (anchorIndex + offset + selectableIds.length) % selectableIds.length

  return [selectableIds[nextIndex]!]
}
