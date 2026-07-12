import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../../../entities'
import {
  getCanvasViewportScale,
  getCanvasViewportScreenBounds,
} from '../../../../core'
import {
  isCanvasTextItem,
  isCanvasStickyComponentItem,
} from '../../../../host'
import {
  CANVAS_APP_TEXT_TARGET,
  type CanvasAppTextTarget,
} from './CanvasAppTextTarget'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  isCanvasKeyboardTypingTarget,
} from '../../interaction/keyboard/CanvasKeyboardShortcutIntent'

export type EditableCanvasTextItem = CanvasItem

export function canCanvasAppEditTextItem({
  canComment,
  canEditDocument,
  item,
}: {
  canComment: boolean
  canEditDocument: boolean
  item: CanvasItem | null
}) {
  return item !== null && (
    canEditDocument ||
    (canComment && item.type === 'comment')
  )
}

type CommitCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: CanvasItem | null
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
  textTarget?: CanvasAppTextTarget
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
  editingItem: CanvasItem | null
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
  textTarget = CANVAS_APP_TEXT_TARGET,
}: CommitCanvasTextEditingArgs) {
  if (!editing) {
    return
  }

  if (!editingItem) {
    setEditing(null)
    return
  }

  const value = getCommittedCanvasTextValue({ editing, editingItem, textTarget })

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
  textTarget = CANVAS_APP_TEXT_TARGET,
  viewport,
}: {
  editing: EditingText | null
  editingItem: CanvasItem | null
  textTarget?: CanvasAppTextTarget
  viewport: Viewport
}): CanvasTextEditorStyle | undefined {
  if (!editing || !editingItem) {
    return undefined
  }
  const bounds = textTarget.getEditorBounds(editingItem)

  if (!bounds) {
    return undefined
  }

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
  item: CanvasItem | null,
) {
  return item !== null &&
    (isCanvasStickyComponentItem(item) || isCanvasTextItem(item))
}

function getCanvasTextEditorFontSize(item: CanvasItem) {
  return 'fontSize' in item && typeof item.fontSize === 'number'
    ? item.fontSize
    : CANVAS_TEXT_EDITOR_DEFAULT_STYLE.fontSize
}

function getCommittedCanvasTextValue({
  editing,
  editingItem,
  textTarget,
}: {
  editing: EditingText
  editingItem: CanvasItem
  textTarget: CanvasAppTextTarget
}) {
  return textTarget.getCommittedValue({
    item: editingItem,
    value: editing.value,
  })
}
