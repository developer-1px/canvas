import {
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import type {
  CanvasDocumentTextSearch,
  CommitCanvasItemsChange,
} from './CanvasWorkflowContract'

type CanvasAppTextDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  findDocumentText: CanvasDocumentTextSearch['findDocumentText']
  replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
}

type UseCanvasAppTextModelArgs = {
  document: CanvasAppTextDocumentModel
  itemReadModel: CanvasItemReadModel
  selection: string[]
  viewport: Viewport
}

type CanvasAppTextModel = {
  blurTextEditor: () => void
  findReplace: ReturnType<typeof useCanvasFindReplaceModel>['findReplace']
  openFindReplace: ReturnType<typeof useCanvasFindReplaceModel>['openFindReplace']
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: ReturnType<typeof useCanvasTextEditorModel>['textEditor']
}

export function useCanvasAppTextModel({
  document,
  itemReadModel,
  selection,
  viewport,
}: UseCanvasAppTextModelArgs): CanvasAppTextModel {
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    blurTextEditor,
    setEditing,
    textEditor,
  } = useCanvasTextEditorModel({
    commitItemsChange: document.commitItemsChange,
    editorRef,
    itemReadModel,
    selection,
    viewport,
  })
  const { findReplace, openFindReplace } = useCanvasFindReplaceModel({
    findDocumentText: document.findDocumentText,
    replaceDocumentText: document.replaceDocumentText,
  })

  return {
    blurTextEditor,
    findReplace,
    openFindReplace,
    setEditing,
    textEditor,
  }
}
