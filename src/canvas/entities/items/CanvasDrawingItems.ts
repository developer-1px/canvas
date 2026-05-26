import type { Point } from '../../core'

import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasDrawingItemBase = CanvasItemBase & {
  opacity: number
  points: Point[]
  stroke: string
  strokeWidth: number
}

export type MarkerItem = CanvasDrawingItemBase & {
  type: 'marker'
}

export type HighlightItem = CanvasDrawingItemBase & {
  type: 'highlight'
}
