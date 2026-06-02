import { describe, expect, it } from 'vitest'
import {
  CANVAS_SVG_ARROW_MARKER_IRI,
  CANVAS_SVG_DRAFT_ARROW_MARKER_IRI,
  createCanvasSvgArrowPathData,
  createCanvasSvgFreehandPathData,
  createCanvasSvgPathData,
  createCanvasSvgPathSegmentData,
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

  it('creates smoothed path data for freehand strokes', () => {
    expect(createCanvasSvgFreehandPathData([])).toBe('')
    expect(createCanvasSvgFreehandPathData([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ])).toBe('M 10 20 L 30 40')
    expect(createCanvasSvgFreehandPathData([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
      { x: 70, y: 40 },
    ])).toBe('M 10 20 Q 30 40 40 50 Q 50 60 60 50 L 70 40')
  })

  it('creates straight and elbow connector paths', () => {
    expect(createCanvasSvgArrowPathData({
      end: { x: 90, y: 60 },
      start: { x: 10, y: 20 },
    })).toBe('M 10 20 L 90 60')
    expect(createCanvasSvgArrowPathData({
      end: { x: 90, y: 60 },
      routing: 'elbow',
      start: { x: 10, y: 20 },
    })).toBe('M 10 20 L 50 20 L 50 60 L 90 60')
  })

  it('creates path data from typed vector path segments', () => {
    expect(createCanvasSvgPathSegmentData([
      { point: { x: 10, y: 20 }, type: 'move' },
      { point: { x: 30, y: 40 }, type: 'line' },
      {
        control1: { x: 40, y: 10 },
        control2: { x: 70, y: 60 },
        point: { x: 90, y: 30 },
        type: 'cubic',
      },
    ])).toBe('M 10 20 L 30 40 C 40 10 70 60 90 30')
  })
})
