import type { CanvasItemBase } from './CanvasItemBase'
import type { CanvasItem } from './CanvasItem'

export type GroupItem = CanvasItemBase & {
  type: 'group'
  children: CanvasItem[]
}
