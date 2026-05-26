import type { CanvasItemId } from '../../core'

import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasCommentItem = CanvasItemBase & {
  type: 'comment'
  attachedTo?: CanvasItemId
  body: string
  resolved?: boolean
}
