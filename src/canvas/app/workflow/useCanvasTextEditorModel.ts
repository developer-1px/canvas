import {
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import { useCanvasTextEditing } from '../text/useCanvasTextEditing'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

type UseCanvasTextEditorModelArgs = {
  commitItemsChange: CommitCanvasItemsChange
  editorRef: RefObject<HTMLTextAreaElement | null>
  itemReadModel: CanvasItemReadModel
  selection: string[]
  viewport: Viewport
}

type CanvasTextEditorModel = {
  blurTextEditor: () => void
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: {
    editing: EditingText | null
    editorRef: RefObject<HTMLTextAreaElement | null>
    style: ReturnType<typeof useCanvasTextEditing>['editorStyle']
    onBlur: () => void
    onCancel: () => void
    onChange: Dispatch<SetStateAction<EditingText | null>>
    onCommit: () => void
  }
}

export function useCanvasTextEditorModel({
  commitItemsChange,
  editorRef,
  itemReadModel,
  selection,
  viewport,
}: UseCanvasTextEditorModelArgs): CanvasTextEditorModel {
  const [editing, setEditing] = useState<EditingText | null>(null)
  const editingItem = editing
    ? itemReadModel.findEditableTextItem(editing.id)
    : null

  const {
    blurTextEditor,
    cancelTextEdit,
    commitText,
    editorStyle,
  } = useCanvasTextEditing({
    commitItemsChange,
    editing,
    editingItem,
    editorRef,
    selection,
    setEditing,
    viewport,
  })

  return {
    blurTextEditor,
    setEditing,
    textEditor: {
      editing,
      editorRef,
      style: editingItem ? editorStyle : undefined,
      onBlur: commitText,
      onCancel: cancelTextEdit,
      onChange: setEditing,
      onCommit: commitText,
    },
  }
}
