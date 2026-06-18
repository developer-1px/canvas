import type {
  CanvasAppCommitItemsChange,
  CanvasAppCommitSelection,
  CanvasAppDocumentClipboard,
  CanvasAppDocumentTextSearch,
} from '../workspace/document/CanvasAppDocumentContracts'
import type { CanvasItem } from '../../entities'
import type { CanvasCommandItem } from '../../foundation'

export type CommitCanvasItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = CanvasAppCommitItemsChange<TItem>

export type CommitCanvasSelection = CanvasAppCommitSelection

export type {
  CanvasAppDocumentClipboard as CanvasDocumentClipboard,
  CanvasAppDocumentTextSearch as CanvasDocumentTextSearch,
}
