import { describe, expect, it } from 'vitest'
import {
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
} from '../../../host'
import {
  createCanvasDraftStroke,
  getNextCanvasDrawingPoints,
} from './CanvasPointerDrawing'

describe('CanvasPointerDrawing', () => {
  it('creates draft strokes from shared drawing style defaults', () => {
    const points = [{ x: 10, y: 20 }, { x: 30, y: 40 }]

    expect(createCanvasDraftStroke('marker', points)).toEqual({
      ...CANVAS_MARKER_STYLE,
      kind: 'marker',
      points,
    })
    expect(createCanvasDraftStroke('highlight', points)).toEqual({
      ...CANVAS_HIGHLIGHT_STYLE,
      kind: 'highlight',
      points,
    })
  })

  it('keeps freehand points sparse unless shift constrains the stroke', () => {
    const startWorld = { x: 10, y: 20 }
    const points = [startWorld]

    expect(getNextCanvasDrawingPoints({
      currentWorld: { x: 11, y: 20 },
      points,
      shiftKey: false,
      startWorld,
    })).toBe(points)
    expect(getNextCanvasDrawingPoints({
      currentWorld: { x: 30, y: 40 },
      points,
      shiftKey: false,
      startWorld,
    })).toEqual([startWorld, { x: 30, y: 40 }])
    expect(getNextCanvasDrawingPoints({
      currentWorld: { x: 30, y: 40 },
      points,
      shiftKey: true,
      startWorld,
    })).toEqual([startWorld, { x: 30, y: 40 }])
  })
})
