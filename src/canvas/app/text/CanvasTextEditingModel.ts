import type {
  EditingText,
  RectItem,
  TextItem,
  Viewport,
} from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

export type EditableCanvasTextItem = RectItem | TextItem

type CommitCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: EditableCanvasTextItem | null
  selection: string[]
  setEditing: (nextEditing: EditingText | null) => void
}

type CanvasTextEditorStyle = {
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
  editingItem: EditableCanvasTextItem | null
  viewport: Viewport
}): CanvasTextEditorStyle | undefined {
  if (!editing || !editingItem) {
    return undefined
  }

  return {
    left: viewport.x + editingItem.x * viewport.scale,
    top: viewport.y + editingItem.y * viewport.scale,
    width: editingItem.w * viewport.scale,
    height: editingItem.h * viewport.scale,
    minHeight: editingItem.h * viewport.scale,
    fontSize: 16 * viewport.scale,
  }
}

function getCommittedCanvasTextValue({
  editing,
  editingItem,
}: {
  editing: EditingText
  editingItem: EditableCanvasTextItem
}) {
  return editingItem.type === 'text' && !editing.value.trim()
    ? 'Text'
    : editing.value
}
