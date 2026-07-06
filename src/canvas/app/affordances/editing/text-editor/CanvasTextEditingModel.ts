import type {
  CanvasEditableTextItem,
  EditingText,
  Viewport,
} from '../../../../entities'
import {
  getCanvasViewportScale,
  getCanvasViewportScreenBounds,
} from '../../../../core'
import {
  getCanvasEditableTextBounds,
  getCommittedCanvasEditableTextValue,
  isCanvasTextItem,
  isCanvasStickyComponentItem,
} from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  isCanvasKeyboardTypingTarget,
} from '../../interaction/keyboard/CanvasKeyboardShortcutIntent'

export type EditableCanvasTextItem = CanvasEditableTextItem

type CommitCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: CanvasEditableTextItem | null
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
}

export type CanvasPrintableTextEditStartIntent =
  | {
      editing: EditingText
      initialText: string
      kind: 'start-editing'
      preventDefault: true
    }
  | {
      kind: 'none'
      preventDefault: false
    }

export type CanvasPrintableTextEditStartKeyboardEvent = Pick<
  KeyboardEvent,
  'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'target'
>

export type CanvasPrintableTextEditStartInput = {
  editingItem: CanvasEditableTextItem | null
  event: CanvasPrintableTextEditStartKeyboardEvent
  isReservedShortcut?: (
    event: CanvasPrintableTextEditStartKeyboardEvent,
  ) => boolean
  isTypingTarget?: (target: EventTarget | null) => boolean
  selection: readonly string[]
}

export type CanvasTextEditorStyle = {
  fontSize: number
  height: number
  left: number
  minHeight: number
  top: number
  width: number
}

const CANVAS_TEXT_EDITOR_DEFAULT_STYLE = Object.freeze({
  fontSize: 16,
})

export function commitCanvasTextEditing({
  commitItemsChange,
  editing,
  editingItem,
  selection,
  setEditing,
}: CommitCanvasTextEditingArgs) {
  if (!editing) {
    return
  }

  if (!editingItem) {
    setEditing(null)
    return
  }

  const value = getCommittedCanvasTextValue({ editing, editingItem })

  commitItemsChange({ type: 'set-text', id: editing.id, text: value }, {
    before: selection,
    after: selection,
  })
  setEditing(null)
}

export function getCanvasPrintableTextEditStartIntent({
  editingItem,
  event,
  isReservedShortcut = () => false,
  isTypingTarget = isCanvasKeyboardTypingTarget,
  selection,
}: CanvasPrintableTextEditStartInput): CanvasPrintableTextEditStartIntent {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isTypingTarget(event.target) ||
    isReservedShortcut(event) ||
    selection.length !== 1 ||
    !editingItem ||
    editingItem.id !== selection[0] ||
    !isCanvasPrintableKeyboardKey(event.key)
  ) {
    return { kind: 'none', preventDefault: false }
  }

  return {
    editing: {
      id: editingItem.id,
      value: event.key,
    },
    initialText: event.key,
    kind: 'start-editing',
    preventDefault: true,
  }
}

export function isCanvasPrintableKeyboardKey(key: string): boolean {
  return key.length === 1
}

export function getCanvasTextEditorStyle({
  editing,
  editingItem,
  viewport,
}: {
  editing: EditingText | null
  editingItem: CanvasEditableTextItem | null
  viewport: Viewport
}): CanvasTextEditorStyle | undefined {
  if (!editing || !editingItem) {
    return undefined
  }
  const bounds = getCanvasEditableTextBounds(editingItem)
  const screenBounds = getCanvasViewportScreenBounds(viewport, bounds)
  const scale = getCanvasViewportScale(viewport)

  return {
    left: screenBounds.x,
    top: screenBounds.y,
    width: screenBounds.w,
    height: screenBounds.h,
    minHeight: screenBounds.h,
    fontSize: getCanvasTextEditorFontSize(editingItem) * scale,
  }
}

export function shouldUseCanvasContentEditableText(
  item: CanvasEditableTextItem | null,
) {
  return item !== null &&
    (isCanvasStickyComponentItem(item) || isCanvasTextItem(item))
}

function getCanvasTextEditorFontSize(item: CanvasEditableTextItem) {
  return 'fontSize' in item && typeof item.fontSize === 'number'
    ? item.fontSize
    : CANVAS_TEXT_EDITOR_DEFAULT_STYLE.fontSize
}

function getCommittedCanvasTextValue({
  editing,
  editingItem,
}: {
  editing: EditingText
  editingItem: CanvasEditableTextItem
}) {
  return getCommittedCanvasEditableTextValue({
    item: editingItem,
    value: editing.value,
  })
}
