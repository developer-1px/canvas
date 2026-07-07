import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppTextTarget } from './CanvasAppTextTarget'
import {
  commitCanvasTextEditing,
  getCanvasTextEditorStyle,
  type EditableCanvasTextItem,
} from './CanvasTextEditingModel'

type UseCanvasTextEditingArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editing: EditingText | null
  editingItem: EditableCanvasTextItem | null
  editorRef: RefObject<HTMLElement | null>
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textTarget?: CanvasAppTextTarget
  viewport: Viewport
}

export function useCanvasTextEditing({
  commitItemsChange,
  editing,
  editingItem,
  editorRef,
  selection,
  setEditing,
  textTarget,
  viewport,
}: UseCanvasTextEditingArgs) {
  const editingId = editing?.id

  useEffect(() => {
    if (!editingId) {
      return
    }

    const frame = requestAnimationFrame(() => {
      const editor = editorRef.current
      editor?.focus()

      if (editor instanceof HTMLTextAreaElement) {
        editor.select()
      }
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
      textTarget,
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
    textTarget,
    viewport,
  })

  return {
    blurTextEditor,
    cancelTextEdit,
    commitText,
    editorStyle,
  }
}
