import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasShapeKind = 'diamond' | 'ellipse' | 'rect'

export type RectItem = CanvasItemBase & {
  type: 'rect'
  fill: string
  shape?: CanvasShapeKind
  stroke: string
  text?: string
}
