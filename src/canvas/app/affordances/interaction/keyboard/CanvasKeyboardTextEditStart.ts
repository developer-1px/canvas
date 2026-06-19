import {
  isCanvasTargetWithinSelector,
  type CanvasInteractionTargetSelectorInput,
} from '../dom/CanvasInteractionTarget'
import { isCanvasKeyboardControlTarget } from './CanvasKeyboardShortcutIntent'

export const CANVAS_KEYBOARD_TEXT_EDIT_START_INTENT_MODEL =
  'canvas-keyboard-text-edit-start-intent'
export const CANVAS_KEYBOARD_TEXT_EDIT_START_KEYS = 'printable'
export const CANVAS_KEYBOARD_TEXT_EDIT_START_MODEL =
  'canvas-keyboard-text-edit-start'

export type CanvasKeyboardTextEditStartKeyboardEvent = {
  altKey: boolean
  ctrlKey: boolean
  isComposing?: boolean
  key: string
  metaKey: boolean
  target: EventTarget | null
}

export type CanvasKeyboardTextEditStartReservedShortcutInput<
  TId extends string = string,
> = {
  event: CanvasKeyboardTextEditStartKeyboardEvent
  key: string
  selectionId: TId
}

export type CanvasKeyboardTextEditStartIntentInput<
  TId extends string = string,
> = {
  blockedTargetSelectors?: CanvasInteractionTargetSelectorInput['selectors']
  event: CanvasKeyboardTextEditStartKeyboardEvent
  isEditableTextSelection: boolean
  isReservedShortcut?: (
    input: CanvasKeyboardTextEditStartReservedShortcutInput<TId>,
  ) => boolean
  selection: readonly TId[]
}

export type CanvasKeyboardTextEditStartIntent<TId extends string = string> =
  | {
      kind: 'none'
      preventDefault: false
    }
  | {
      initialText: string
      kind: 'start-text-edit'
      preventDefault: true
      targetId: TId
    }

export function getCanvasKeyboardTextEditStartIntent<
  TId extends string = string,
>({
  blockedTargetSelectors,
  event,
  isEditableTextSelection,
  isReservedShortcut,
  selection,
}: CanvasKeyboardTextEditStartIntentInput<TId>):
  CanvasKeyboardTextEditStartIntent<TId> {
  const selectionId = selection.length === 1 ? selection[0] : undefined

  if (
    selectionId === undefined ||
    !isEditableTextSelection ||
    !isCanvasKeyboardTextEditStartKey(event) ||
    isCanvasKeyboardControlTarget(event.target) ||
    (blockedTargetSelectors !== undefined &&
      isCanvasTargetWithinSelector({ selectors: blockedTargetSelectors, target: event.target })) ||
    isReservedShortcut?.({ event, key: event.key, selectionId }) === true
  ) {
    return getCanvasKeyboardTextEditStartNoneIntent()
  }

  return {
    initialText: event.key,
    kind: 'start-text-edit',
    preventDefault: true,
    targetId: selectionId,
  }
}

export function isCanvasKeyboardTextEditStartKey({
  altKey,
  ctrlKey,
  isComposing,
  key,
  metaKey,
}: CanvasKeyboardTextEditStartKeyboardEvent) {
  return key.length === 1 &&
    !altKey &&
    !ctrlKey &&
    !metaKey &&
    isComposing !== true
}

function getCanvasKeyboardTextEditStartNoneIntent():
  CanvasKeyboardTextEditStartIntent<never> {
  return {
    kind: 'none',
    preventDefault: false,
  }
}
