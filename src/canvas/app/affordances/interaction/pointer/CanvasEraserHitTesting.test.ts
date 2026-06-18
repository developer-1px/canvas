import { describe, expect, it } from 'vitest'
import {
  getCanvasEraserHitStrokeIds,
  getNextCanvasEraserPoints,
  type CanvasEraserStrokeHitTestStroke,
} from './CanvasEraserHitTesting'

describe('CanvasEraserHitTesting', () => {
  it('hit-tests host stroke objects without CanvasItem shape coupling', () => {
    const strokes: CanvasEraserStrokeHitTestStroke[] = [
      {
        id: 'freeform-1',
        points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        strokeWidth: 4,
      },
      {
        id: 'hidden-freeform',
        points: [{ x: 0, y: 4 }, { x: 100, y: 4 }],
        strokeWidth: 4,
        visible: false,
      },
      {
        id: 'locked-freeform',
        locked: true,
        points: [{ x: 0, y: 6 }, { x: 100, y: 6 }],
        strokeWidth: 4,
      },
    ]

    expect(getCanvasEraserHitStrokeIds({
      points: [{ x: 50, y: 6 }],
      radius: 6,
      strokes,
    })).toEqual(['freeform-1'])
  })

  it('preserves a target stroke hit before geometry hits are merged', () => {
    expect(getCanvasEraserHitStrokeIds({
      points: [{ x: 50, y: 80 }],
      radius: 6,
      strokes: [{
        id: 'target-freeform',
        points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        strokeWidth: 4,
      }],
      targetStrokeId: 'target-freeform',
    })).toEqual(['target-freeform'])
  })

  it('samples sparse eraser points independently from the host model', () => {
    expect(getNextCanvasEraserPoints({
      currentWorld: { x: 0, y: 10 },
      pointDistance: 4,
      points: [{ x: 0, y: 0 }],
    })).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 4 },
      { x: 0, y: 8 },
      { x: 0, y: 10 },
    ])
  })
})
