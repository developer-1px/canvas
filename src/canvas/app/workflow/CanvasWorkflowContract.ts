import type {
  CanvasAppCommitItemsChange,
  CanvasAppCommitSelection,
  CanvasAppDocumentClipboard,
  CanvasAppDocumentTextSearch,
} from '../document/CanvasAppDocumentContracts'

export type CommitCanvasItemsChange = CanvasAppCommitItemsChange

export type CommitCanvasSelection = CanvasAppCommitSelection

export type {
  CanvasAppDocumentClipboard as CanvasDocumentClipboard,
  CanvasAppDocumentTextSearch as CanvasDocumentTextSearch,
}
