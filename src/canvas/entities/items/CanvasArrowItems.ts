import type {
  CanvasItemId,
  Point,
} from '../../core'

import type { CanvasItemBase } from './CanvasItemBase'

export type ArrowItem = CanvasItemBase & {
  type: 'arrow'
  arrowhead?: CanvasArrowhead
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

// `end` keeps the arrowhead (default); `none` draws a plain line.
export type CanvasArrowhead = 'end' | 'none'
