import type { ArrowItem } from './CanvasArrowItems'
import type { CanvasCommentItem } from './CanvasCommentItems'
import type { CanvasComponentItem } from './CanvasComponentItems'
import type { CanvasCustomItem } from './CanvasCustomItems'
import type {
  HighlightItem,
  MarkerItem,
} from './CanvasDrawingItems'
import type { GroupItem } from './CanvasGroupItems'
import type { CanvasImageItem } from './CanvasImageItems'
import type { RectItem } from './CanvasShapeItems'
import type { CanvasStampItem } from './CanvasStampItems'
import type { TextItem } from './CanvasTextItems'

export type CanvasItem =
  | RectItem
  | TextItem
  | CanvasImageItem
  | CanvasCommentItem
  | CanvasStampItem
  | MarkerItem
  | HighlightItem
  | ArrowItem
  | GroupItem
  | CanvasComponentItem
  | CanvasCustomItem
