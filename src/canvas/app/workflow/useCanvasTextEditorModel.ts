import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasAffordanceConfig } from '../../engine'
import { CANVAS_APP_TEXT_TARGET } from '../affordances/editing/text-editor/CanvasAppTextTarget'
import { useCanvasTextEditing } from '../affordances/editing/text-editor/useCanvasTextEditing'
import {
  shouldUseCanvasContentEditableText,
  type CanvasTextEditorStyle,
} from '../affordances/editing/text-editor/CanvasTextEditingModel'
import type {
  CanvasInlineTextEditingContextValue,
} from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

type UseCanvasTextEditorModelArgs = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  editorRef: RefObject<HTMLElement | null>
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  viewport: Viewport
}

type CanvasTextEditorModel = {
  blurTextEditor: () => void
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: {
    editing: EditingText | null
    editorRef: RefObject<HTMLElement | null>
    commitOnEnter: boolean
    style: CanvasTextEditorStyle | undefined
    visible: boolean
    onBlur: () => void
    onCancel: () => void
    onChange: Dispatch<SetStateAction<EditingText | null>>
    onCommit: () => void
  }
  inlineTextEditor: CanvasInlineTextEditingContextValue
}

export function useCanvasTextEditorModel({
  commitItemsChange,
  config,
  editorRef,
  itemReadModel,
  selection,
  viewport,
}: UseCanvasTextEditorModelArgs): CanvasTextEditorModel {
  const [editing, setEditing] = useState<EditingText | null>(null)
  const [dismissedInlineTextId, setDismissedInlineTextId] =
    useState<string | null>(null)
  const editingItem = editing
    ? itemReadModel.findEditableTextItem(editing.id)
    : null
  const selectedInlineTextItem = selection.length === 1
    ? itemReadModel.findEditableTextItem(selection[0] ?? '')
    : null
  const selectedInlineTextId =
    shouldUseCanvasContentEditableText(selectedInlineTextItem)
      ? selectedInlineTextItem.id
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

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDismissedInlineTextId((current) =>
        current !== null && current !== selectedInlineTextId ? null : current
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedInlineTextId])

  useEffect(() => {
    if (
      !config.overlays.textEditor ||
      !selectedInlineTextItem ||
      selectedInlineTextId === null ||
      dismissedInlineTextId === selectedInlineTextId
    ) {
      return
    }

    const frame = requestAnimationFrame(() => {
      setEditing((current) =>
        current?.id === selectedInlineTextId
          ? current
          : {
            id: selectedInlineTextId,
            value: CANVAS_APP_TEXT_TARGET.getValue(selectedInlineTextItem),
          }
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [
    config.overlays.textEditor,
    dismissedInlineTextId,
    selectedInlineTextId,
    selectedInlineTextItem,
  ])

  const commitOnEnter = editingItem
    ? CANVAS_APP_TEXT_TARGET.commitsOnEnter(editingItem)
    : true
  const useContentEditableText = shouldUseCanvasContentEditableText(editingItem)
  const setEditorElement = useCallback((element: HTMLElement | null) => {
    editorRef.current = element
  }, [editorRef])
  function dismissInlineTextEditing() {
    if (editing && useContentEditableText) {
      setDismissedInlineTextId(editing.id)
    }
  }

  function commitInlineText() {
    dismissInlineTextEditing()
    commitText()
  }

  function cancelInlineTextEdit() {
    dismissInlineTextEditing()
    cancelTextEdit()
  }

  const inlineTextEditor = {
    commitOnEnter: useContentEditableText ? false : commitOnEnter,
    editing,
    enabled: config.overlays.textEditor,
    setEditorElement,
    onBlur: commitInlineText,
    onCancel: cancelInlineTextEdit,
    onChange: setEditing,
    onCommit: commitInlineText,
  }

  return {
    blurTextEditor,
    inlineTextEditor,
    setEditing,
    textEditor: {
      editing,
      editorRef,
      commitOnEnter,
      style: editingItem ? editorStyle : undefined,
      visible: config.overlays.textEditor && !useContentEditableText,
      onBlur: commitText,
      onCancel: cancelTextEdit,
      onChange: setEditing,
      onCommit: commitText,
    },
  }
}
