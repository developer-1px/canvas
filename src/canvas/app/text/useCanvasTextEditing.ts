import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  commitCanvasTextEditing,
  getCanvasTextEditorStyle,
  type EditableCanvasTextItem,
} from './CanvasTextEditingModel'

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
    commitCanvasTextEditing({
      commitItemsChange,
      editing,
      editingItem,
      selection,
      setEditing,
    })
  }

  function cancelTextEdit() {
    setEditing(null)
  }

  function blurTextEditor() {
    editorRef.current?.blur()
  }

  const editorStyle = getCanvasTextEditorStyle({
    editing,
    editingItem,
    viewport,
  })

  return {
    blurTextEditor,
    cancelTextEdit,
    commitText,
    editorStyle,
  }
}
