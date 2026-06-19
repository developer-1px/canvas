import {
  isCanvasTargetWithinSelector,
  type CanvasInteractionTargetSelectorInput,
} from '../dom/CanvasInteractionTarget'
import { isCanvasKeyboardControlTarget } from './CanvasKeyboardShortcutIntent'

export const CANVAS_KEYBOARD_SELECTION_CYCLE_INTENT_MODEL =
  'canvas-keyboard-selection-cycle-intent'
export const CANVAS_KEYBOARD_SELECTION_CYCLE_KEYS = 'Tab Shift+Tab'
export const CANVAS_KEYBOARD_SELECTION_CYCLE_MODEL =
  'canvas-keyboard-selection-cycle'

export type CanvasKeyboardSelectionCycleDirection = 'next' | 'previous'

export type CanvasKeyboardSelectionCycleKeyboardEvent = {
  altKey: boolean
  ctrlKey: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
  target: EventTarget | null
}

export type CanvasKeyboardSelectionCycleIntentInput<
  TId extends string = string,
> = {
  blockedTargetSelectors?: CanvasInteractionTargetSelectorInput['selectors']
  event: CanvasKeyboardSelectionCycleKeyboardEvent
  selectableIds: readonly TId[]
  selection: readonly TId[]
  targetSelectors?: CanvasInteractionTargetSelectorInput['selectors']
}

export type CanvasKeyboardSelectionCycleTargetInput = {
  blockedTargetSelectors?: CanvasInteractionTargetSelectorInput['selectors']
  target: EventTarget | null
  targetSelectors?: CanvasInteractionTargetSelectorInput['selectors']
}

export type CanvasKeyboardSelectionCycleIntent<
  TId extends string = string,
> =
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }
  | {
      direction: CanvasKeyboardSelectionCycleDirection
      fromId: TId | null
      index: number
      kind: 'cycle-selection'
      preventDefault: true
      selectableIds: readonly TId[]
      stopPropagation: false
      targetId: TId
    }

export function getCanvasKeyboardSelectionCycleIntent<
  TId extends string = string,
>({
  blockedTargetSelectors,
  event,
  selectableIds,
  selection,
  targetSelectors,
}: CanvasKeyboardSelectionCycleIntentInput<TId>):
  CanvasKeyboardSelectionCycleIntent<TId> {
  if (
    event.key !== 'Tab' ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    selectableIds.length === 0 ||
    !isCanvasKeyboardSelectionCycleTarget({
      blockedTargetSelectors,
      target: event.target,
      targetSelectors,
    })
  ) {
    return getCanvasKeyboardSelectionCycleNoneIntent()
  }

  const direction = event.shiftKey ? 'previous' : 'next'
  const fromId = [...selection]
    .reverse()
    .find((id) => selectableIds.includes(id)) ?? null
  const currentIndex = fromId === null ? -1 : selectableIds.indexOf(fromId)
  const targetIndex = currentIndex >= 0
    ? getCanvasKeyboardSelectionCycleIndex({
      count: selectableIds.length,
      currentIndex,
      direction,
    })
    : direction === 'next'
      ? 0
      : selectableIds.length - 1
  const targetId = selectableIds[targetIndex]

  if (targetId === undefined) {
    return getCanvasKeyboardSelectionCycleNoneIntent()
  }

  return {
    direction,
    fromId,
    index: targetIndex,
    kind: 'cycle-selection',
    preventDefault: true,
    selectableIds,
    stopPropagation: false,
    targetId,
  }
}

export function isCanvasKeyboardSelectionCycleTarget({
  blockedTargetSelectors,
  target,
  targetSelectors,
}: CanvasKeyboardSelectionCycleTargetInput) {
  if (
    isCanvasKeyboardControlTarget(target) ||
    (blockedTargetSelectors !== undefined &&
      isCanvasTargetWithinSelector({ selectors: blockedTargetSelectors, target }))
  ) {
    return false
  }

  return targetSelectors === undefined ||
    isCanvasTargetWithinSelector({ selectors: targetSelectors, target })
}

function getCanvasKeyboardSelectionCycleIndex({
  count,
  currentIndex,
  direction,
}: {
  count: number
  currentIndex: number
  direction: CanvasKeyboardSelectionCycleDirection
}) {
  return direction === 'next'
    ? (currentIndex + 1) % count
    : (currentIndex - 1 + count) % count
}

function getCanvasKeyboardSelectionCycleNoneIntent():
  CanvasKeyboardSelectionCycleIntent<never> {
  return {
    kind: 'none',
    preventDefault: false,
    stopPropagation: false,
  }
}
