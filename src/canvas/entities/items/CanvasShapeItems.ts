import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasShapeType = 'diamond' | 'ellipse' | 'rect'

export type CanvasShapeKind = CanvasShapeType

export type CanvasShapeItem = CanvasItemBase & {
  type: 'shape'
  fill: string
  fontSize?: number
  opacity?: number
  shapeType: CanvasShapeType
  stroke: string
  strokeWidth?: number
  text?: string
  textAlign?: 'center' | 'left' | 'right'
}

export type RectItem = CanvasItemBase & {
  type: 'rect'
  fill: string
  fontSize?: number
  opacity?: number
  shape?: CanvasShapeType
  stroke: string
  strokeWidth?: number
  text?: string
  textAlign?: 'center' | 'left' | 'right'
}

export type CanvasShapeLikeItem = CanvasShapeItem | RectItem
