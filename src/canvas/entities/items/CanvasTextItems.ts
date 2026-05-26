import type { CanvasItemId } from '../../core'

import type { ArrowItem } from './CanvasArrowItems'
import type { CanvasCommentItem } from './CanvasCommentItems'
import type { CanvasComponentItem } from './CanvasComponentItems'
import type { CanvasItemBase } from './CanvasItemBase'
import type { RectItem } from './CanvasShapeItems'

export type TextItem = CanvasItemBase & {
  type: 'text'
  text: string
}

export type CanvasEditableTextItem =
  | ArrowItem
  | CanvasCommentItem
  | RectItem
  | TextItem
  | CanvasComponentItem

export type EditingText = {
  id: CanvasItemId
  value: string
}
