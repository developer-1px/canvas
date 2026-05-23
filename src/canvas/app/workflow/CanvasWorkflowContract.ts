import type { SetStateAction } from 'react'
import type {
  CanvasDocumentClipboard,
  CanvasDocumentSelectionHistory,
  CanvasDocumentTextSearch,
  CanvasItemsChange,
} from '../../host'

export type CommitCanvasItemsChange = (
  change: CanvasItemsChange,
  selection?: CanvasDocumentSelectionHistory,
) => boolean

export type CommitCanvasSelection = (
  action: SetStateAction<string[]>,
) => boolean

export type {
  CanvasDocumentClipboard,
  CanvasDocumentTextSearch,
}
