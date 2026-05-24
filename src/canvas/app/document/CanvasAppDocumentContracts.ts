import type { SetStateAction } from 'react'
import type {
  CanvasDocumentClipboard,
  CanvasDocumentSelectionHistory,
  CanvasDocumentTextSearch,
  CanvasItemsChange,
} from '../../host'

export type CanvasAppItemsChange = CanvasItemsChange

export type CanvasAppDocumentSelectionHistory =
  CanvasDocumentSelectionHistory

export type CanvasAppDocumentClipboard = CanvasDocumentClipboard

export type CanvasAppDocumentTextSearch = CanvasDocumentTextSearch

export type CanvasAppCommitItemsChange = (
  change: CanvasAppItemsChange,
  selection?: CanvasAppDocumentSelectionHistory,
) => boolean

export type CanvasAppCommitSelection = (
  action: SetStateAction<string[]>,
) => boolean
