import {
  useEffect,
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../core'
import type {
  EditingText,
  RectItem,
  TextItem,
} from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type EditableCanvasTextItem = RectItem | TextItem

type UseCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: EditableCanvasTextItem | null
  editorRef: RefObject<HTMLTextAreaElement | null>
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export function useCanvasTextEditing({
  commitItemsChange,
  editing,
  editingItem,
  editorRef,
  selection,
  setEditing,
  viewport,
}: UseCanvasTextEditingArgs) {
  const editingId = editing?.id

  useEffect(() => {
    if (!editingId) {
      return
    }

    const frame = requestAnimationFrame(() => {
      editorRef.current?.focus()
      editorRef.current?.select()
    })

    return () => cancelAnimationFrame(frame)
  }, [editingId, editorRef])

  function commitText() {
    if (!editing) {
      return
    }

    if (!editingItem) {
      setEditing(null)
      return
    }

    const value =
      editingItem.type === 'text' && !editing.value.trim()
        ? 'Text'
        : editing.value

    commitItemsChange({ type: 'set-text', id: editing.id, text: value }, {
      before: selection,
      after: selection,
    })
    setEditing(null)
  }

  function cancelTextEdit() {
    setEditing(null)
  }

  function blurTextEditor() {
    editorRef.current?.blur()
  }

  const editorStyle: CSSProperties | undefined =
    editingItem && editing
      ? {
          left: viewport.x + editingItem.x * viewport.scale,
          top: viewport.y + editingItem.y * viewport.scale,
          width: editingItem.w * viewport.scale,
          height: editingItem.h * viewport.scale,
          minHeight: editingItem.h * viewport.scale,
          fontSize: 16 * viewport.scale,
        }
      : undefined

  return {
    blurTextEditor,
    cancelTextEdit,
    commitText,
    editorStyle,
  }
}
