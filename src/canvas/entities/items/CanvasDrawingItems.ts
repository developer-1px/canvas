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

export type CanvasPathMoveSegment = {
  point: Point
  type: 'move'
}

export type CanvasPathLineSegment = {
  point: Point
  type: 'line'
}

export type CanvasPathCubicSegment = {
  control1: Point
  control2: Point
  point: Point
  type: 'cubic'
}

export type CanvasPathSegment =
  | CanvasPathMoveSegment
  | CanvasPathLineSegment
  | CanvasPathCubicSegment

export type PathItem = CanvasItemBase & {
  fill?: string
  opacity: number
  segments: CanvasPathSegment[]
  stroke: string
  strokeWidth: number
  type: 'path'
}
