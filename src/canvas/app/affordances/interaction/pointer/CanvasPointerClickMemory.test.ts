import { describe, expect, it } from 'vitest'
import {
  getCanvasResizeHandleDoubleClickIntent,
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

  it('returns auto-size intent for repeated resize handle clicks', () => {
    const first = getCanvasResizeHandleDoubleClickIntent({
      handle: 'se',
      handleId: 'slide-1:rect-1:se',
      lastClick: null,
      point: { x: 10, y: 20 },
      time: 1000,
    })
    const second = getCanvasResizeHandleDoubleClickIntent({
      handle: 'se',
      handleId: 'slide-1:rect-1:se',
      lastClick: first.nextClick,
      point: { x: 11, y: 21 },
      time: 1200,
    })

    expect(first).toEqual({
      intent: null,
      isDoubleClick: false,
      nextClick: {
        id: 'slide-1:rect-1:se',
        point: { x: 10, y: 20 },
        time: 1000,
      },
    })
    expect(second).toEqual({
      intent: {
        handle: 'se',
        kind: 'auto-size-selection',
      },
      isDoubleClick: true,
      nextClick: {
        id: 'slide-1:rect-1:se',
        point: { x: 11, y: 21 },
        time: 1200,
      },
    })
  })

  it('does not return auto-size intent across different resize handles', () => {
    const lastClick: CanvasPointerClickMemory = {
      id: 'slide-1:rect-1:e',
      point: { x: 10, y: 20 },
      time: 1000,
    }

    expect(getCanvasResizeHandleDoubleClickIntent({
      handle: 'se',
      handleId: 'slide-1:rect-1:se',
      lastClick,
      point: { x: 10, y: 20 },
      time: 1100,
    }).intent).toBeNull()
  })
})
