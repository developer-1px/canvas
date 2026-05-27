import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasShapeType = 'diamond' | 'ellipse' | 'rect'

export type CanvasShapeKind = CanvasShapeType

export type CanvasShapeItem = CanvasItemBase & {
  type: 'shape'
  fill: string
  shapeType: CanvasShapeType
  stroke: string
  text?: string
}

export type RectItem = CanvasItemBase & {
  type: 'rect'
  fill: string
  shape?: CanvasShapeType
  stroke: string
  text?: string
}

export type CanvasShapeLikeItem = CanvasShapeItem | RectItem
