import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type {
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type {
  CanvasDocumentTextSearch,
  CommitCanvasItemsChange,
} from './CanvasWorkflowContract'

export type CanvasAppTextDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  findDocumentText: CanvasDocumentTextSearch['findDocumentText']
  replaceDocumentText: CanvasDocumentTextSearch['replaceDocumentText']
}

export type CanvasAppTextModelInput = {
  config: CanvasAffordanceConfig
  document: CanvasAppTextDocumentModel
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  viewport: Viewport
}

export type CanvasAppTextRuntime<
  TFindReplace,
  TTextEditor,
  TInlineTextEditor,
> = {
  blurTextEditor: () => void
  findReplace: TFindReplace
  inlineTextEditor: TInlineTextEditor
  openFindReplace: () => void
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  textEditor: TTextEditor
}
