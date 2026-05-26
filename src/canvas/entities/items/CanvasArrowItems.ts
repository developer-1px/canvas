import type {
  CanvasItemId,
  Point,
} from '../../core'

import type { CanvasItemBase } from './CanvasItemBase'

export type ArrowItem = CanvasItemBase & {
  type: 'arrow'
  end: Point
  endAttachedTo?: CanvasItemId
  routing?: CanvasArrowRouting
  start: Point
  startAttachedTo?: CanvasItemId
  stroke: string
  strokeWidth: number
  text?: string
}

export type CanvasArrowEndpoint = 'end' | 'start'
export type CanvasArrowRouting = 'elbow' | 'straight'
