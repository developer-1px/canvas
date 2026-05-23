import {
  useRef,
} from 'react'
import type {
  Viewport,
} from '../../entities'
import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasItemReadModel } from '../../host'
import { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import { getCanvasAppTextConsumerModel } from './CanvasAppTextConsumerModel'
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
  config: CanvasAffordanceConfig
  document: CanvasAppTextDocumentModel
  itemReadModel: CanvasItemReadModel
  selection: string[]
  viewport: Viewport
}

export function useCanvasAppTextModel({
  config,
  document,
  itemReadModel,
  selection,
  viewport,
}: UseCanvasAppTextModelArgs) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    blurTextEditor,
    setEditing,
    textEditor,
  } = useCanvasTextEditorModel({
    commitItemsChange: document.commitItemsChange,
    config,
    editorRef,
    itemReadModel,
    selection,
    viewport,
  })
  const { findReplace, openFindReplace } = useCanvasFindReplaceModel({
    enabled: config.overlays.findReplace,
    findDocumentText: document.findDocumentText,
    replaceDocumentText: document.replaceDocumentText,
  })

  return getCanvasAppTextConsumerModel({
    blurTextEditor,
    findReplace,
    openFindReplace,
    setEditing,
    textEditor,
  })
}
