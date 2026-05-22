import type { Point } from '../CanvasPrimitives'

export type CanvasAlignmentGuide = {
  end: number
  orientation: 'horizontal' | 'vertical'
  position: number
  start: number
}

export type CanvasSpacingGuide = {
  gap: number
  orientation: 'horizontal' | 'vertical'
  segments: Array<{
    end: Point
    start: Point
  }>
}

export type CanvasSnapGuides = {
  alignmentGuides: CanvasAlignmentGuide[]
  spacingGuides: CanvasSpacingGuide[]
}

export type CanvasAxisSnap<TGuide> = {
  dx: number
  dy: number
  guides: TGuide[]
  x: boolean
  y: boolean
}

export const EMPTY_CANVAS_SNAP_GUIDES: CanvasSnapGuides = {
  alignmentGuides: [],
  spacingGuides: [],
}

export function createEmptyCanvasAxisSnap<TGuide>(): CanvasAxisSnap<TGuide> {
  return {
    dx: 0,
    dy: 0,
    guides: [],
    x: false,
    y: false,
  }
}
