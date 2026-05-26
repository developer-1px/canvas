import type {
  CanvasEditableTextItem,
  EditingText,
  Viewport,
} from '../../../entities'
import {
  getCanvasEditableTextBounds,
  getCommittedCanvasEditableTextValue,
} from '../../../host'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'

export type EditableCanvasTextItem = CanvasEditableTextItem

type CommitCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: CanvasEditableTextItem | null
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
}

export type CanvasTextEditorStyle = {
  fontSize: number
  height: number
  left: number
  minHeight: number
  top: number
  width: number
}

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

  return {
    left: viewport.x + bounds.x * viewport.scale,
    top: viewport.y + bounds.y * viewport.scale,
    width: bounds.w * viewport.scale,
    height: bounds.h * viewport.scale,
    minHeight: bounds.h * viewport.scale,
    fontSize: 16 * viewport.scale,
  }
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
