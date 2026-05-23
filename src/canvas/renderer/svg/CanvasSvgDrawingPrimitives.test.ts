import { describe, expect, it } from 'vitest'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CANVAS_SVG_DRAFT_ARROW_MARKER_IRI,
  createCanvasSvgPathData,
} from './CanvasSvgDrawingPrimitives'

describe('CanvasSvgDrawingPrimitives', () => {
  it('owns shared svg marker IRIs', () => {
    expect(CANVAS_SVG_ARROW_MARKER_IRI).toBe('url(#canvas-arrow-head)')
    expect(CANVAS_SVG_DRAFT_ARROW_MARKER_IRI)
      .toBe('url(#canvas-draft-arrow-head)')
  })

  it('creates path data from world points', () => {
    expect(createCanvasSvgPathData([])).toBe('')
    expect(createCanvasSvgPathData([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ])).toBe('M 10 20 L 30 40 L 50 60')
  })
})
