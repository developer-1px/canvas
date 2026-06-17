import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasPointerLocalGeometry,
  getCanvasPointerLocalPoint,
  getCanvasWorldClientPoint,
  type CanvasPointerLocalTarget,
  type CanvasWorldClientPointStageElement,
} from './CanvasPointerGeometry'

describe('CanvasPointerGeometry', () => {
  it('returns pointer coordinates relative to the target rect', () => {
    const target = createLocalTarget({
      height: 120,
      left: 24,
      top: 36,
      width: 240,
    })

    expect(getCanvasPointerLocalGeometry({
      event: { clientX: 74, clientY: 96 },
      target,
    })).toEqual({
      point: { x: 50, y: 60 },
      rect: {
        height: 120,
        left: 24,
        top: 36,
        width: 240,
      },
    })
  })

  it('returns only the local point when rect metadata is not needed', () => {
    const target = createLocalTarget({
      height: 80,
      left: 10,
      top: 20,
      width: 160,
    })

    expect(getCanvasPointerLocalPoint({
      event: { clientX: 15, clientY: 35 },
      target,
    })).toEqual({ x: 5, y: 15 })
  })

  it('returns null when the target or rect API is missing', () => {
    expect(getCanvasPointerLocalGeometry({
      event: { clientX: 15, clientY: 35 },
      target: null,
    })).toBeNull()
    expect(getCanvasPointerLocalGeometry({
      event: { clientX: 15, clientY: 35 },
      target: {},
    })).toBeNull()
    expect(getCanvasPointerLocalPoint({
      event: { clientX: 15, clientY: 35 },
      target: null,
    })).toBeNull()
  })

  it('projects a world point to a browser client point with stage offset', () => {
    expect(getCanvasWorldClientPoint({
      point: { x: 40, y: 50 },
      stageElement: createStageElement({
        height: 400,
        left: 100,
        top: 80,
        width: 600,
      }),
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({
      x: 190,
      y: 200,
    })
  })

  it('projects a world point without stage offset when rect is missing', () => {
    expect(getCanvasWorldClientPoint({
      point: { x: 40, y: 50 },
      stageElement: createStageElement(null),
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({
      x: 90,
      y: 120,
    })
  })
})

function createLocalTarget(rect: {
  height: number
  left: number
  top: number
  width: number
}): CanvasPointerLocalTarget {
  return {
    getBoundingClientRect: vi.fn(() => rect),
  }
}

function createStageElement(
  rect: ReturnType<CanvasWorldClientPointStageElement['getRect']>,
): CanvasWorldClientPointStageElement {
  return {
    getRect: vi.fn(() => rect),
  }
}
