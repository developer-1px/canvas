import {
  useRef,
} from 'react'
import { useCanvasFindReplaceModel } from '../feature-packs'
import { useCanvasTextEditorModel } from './useCanvasTextEditorModel'
import { getCanvasAppTextConsumerModel } from './CanvasAppTextConsumerModel'
import type { CanvasAppTextModelInput } from './CanvasAppTextConsumerContracts'

export function useCanvasAppTextModel({
  config,
  document,
  itemReadModel,
  selection,
  viewport,
}: CanvasAppTextModelInput) {
  const editorRef = useRef<HTMLElement | null>(null)
  const {
    blurTextEditor,
    inlineTextEditor,
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
    inlineTextEditor,
    openFindReplace,
    setEditing,
    textEditor,
  })
}
