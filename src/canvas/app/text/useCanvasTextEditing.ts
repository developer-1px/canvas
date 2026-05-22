import {
  useEffect,
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../engine/primitives/CanvasPrimitives'
import type {
  CanvasItem,
  EditingText,
  RectItem,
  TextItem,
} from '../../host/model/CanvasModel'
import { createSetCanvasItemTextPatch } from '../../host/document/CanvasDocumentPatches'
import type { CommitCanvasItemsPatch } from '../document/useCanvasDocument'

type EditableCanvasTextItem = RectItem | TextItem

type UseCanvasTextEditingArgs = {
  commitItemsPatch: CommitCanvasItemsPatch
  editing: EditingText | null
  editingItem: EditableCanvasTextItem | null
  editorRef: RefObject<HTMLTextAreaElement | null>
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export function useCanvasTextEditing({
  commitItemsPatch,
  editing,
  editingItem,
  editorRef,
  items,
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

    commitItemsPatch(createSetCanvasItemTextPatch(items, editing.id, value), {
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
