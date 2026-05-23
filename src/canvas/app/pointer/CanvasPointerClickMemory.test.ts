import { describe, expect, it } from 'vitest'
import {
  recordCanvasItemPointerClick,
  type CanvasPointerClickMemory,
} from './CanvasPointerClickMemory'

describe('CanvasPointerClickMemory', () => {
  it('records the next click and detects a near repeated item click', () => {
    const first = recordCanvasItemPointerClick({
      itemId: 'rect-1',
      lastClick: null,
      point: { x: 10, y: 20 },
      time: 1000,
    })
    const second = recordCanvasItemPointerClick({
      itemId: 'rect-1',
      lastClick: first.nextClick,
      point: { x: 13, y: 24 },
      time: 1200,
    })

    expect(first).toEqual({
      isDoubleClick: false,
      nextClick: {
        id: 'rect-1',
        point: { x: 10, y: 20 },
        time: 1000,
      },
    })
    expect(second.isDoubleClick).toBe(true)
    expect(second.nextClick).toEqual({
      id: 'rect-1',
      point: { x: 13, y: 24 },
      time: 1200,
    })
  })

  it('rejects double click memory across item id time and distance changes', () => {
    const lastClick: CanvasPointerClickMemory = {
      id: 'rect-1',
      point: { x: 10, y: 20 },
      time: 1000,
    }

    expect(
      recordCanvasItemPointerClick({
        itemId: 'rect-2',
        lastClick,
        point: { x: 10, y: 20 },
        time: 1100,
      }).isDoubleClick,
    ).toBe(false)
    expect(
      recordCanvasItemPointerClick({
        itemId: 'rect-1',
        lastClick,
        point: { x: 10, y: 20 },
        time: 1400,
      }).isDoubleClick,
    ).toBe(false)
    expect(
      recordCanvasItemPointerClick({
        itemId: 'rect-1',
        lastClick,
        point: { x: 20, y: 20 },
        time: 1100,
      }).isDoubleClick,
    ).toBe(false)
  })
})
