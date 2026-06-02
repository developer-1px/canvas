import type { CanvasItemId } from '../../core'

import type { ArrowItem } from './CanvasArrowItems'
import type { CanvasCommentItem } from './CanvasCommentItems'
import type { CanvasComponentItem } from './CanvasComponentItems'
import type { CanvasItemBase } from './CanvasItemBase'
import type {
  CanvasShapeItem,
  RectItem,
} from './CanvasShapeItems'

export type TextItem = CanvasItemBase & {
  type: 'text'
  fontSize?: number
  opacity?: number
  text: string
  textAlign?: 'center' | 'left' | 'right'
}

export type CanvasEditableTextItem =
  | ArrowItem
  | CanvasCommentItem
  | CanvasShapeItem
  | RectItem
  | TextItem
  | CanvasComponentItem

export type EditingText = {
  id: CanvasItemId
  value: string
}
