import { describe, expect, test } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  getCanvasWheelViewport,
  shouldHandleCanvasWheelViewport,
  type CanvasWheelInput,
} from './CanvasViewportEngine'
import type { Viewport } from '../../core'

const config = createCanvasAffordanceConfig()
const viewport: Viewport = { x: 0, y: 0, scale: 1 }
const baseWheel: CanvasWheelInput = {
  ctrlKey: false,
  deltaMode: 0,
  deltaX: 0,
  deltaY: 0,
  metaKey: false,
  shiftKey: false,
}

describe('CanvasViewportEngine', () => {
  test('uses wheel delta as 0.9x pan offset for trackpads', () => {
    expect(
      getCanvasWheelViewport({
        config,
        input: {
          ...baseWheel,
          deltaX: 10,
          deltaY: 20,
        },
        point: { x: 100, y: 100 },
        viewport,
      }),
    ).toEqual({ x: -9, y: -18, scale: 1 })
  })

  test('uses pinch wheel input as 3x zoom around the pointer', () => {
    const next = getCanvasWheelViewport({
      config,
      input: {
        ...baseWheel,
        ctrlKey: true,
        deltaY: -100,
      },
      point: { x: 100, y: 100 },
      viewport,
    })

    expect(next?.scale).toBeCloseTo(Math.exp(0.3))
    expect(next?.x).toBeCloseTo(100 - 100 * Math.exp(0.3))
    expect(next?.y).toBeCloseTo(100 - 100 * Math.exp(0.3))
  })

  test('routes ordinary wheel to pan and pinch wheel to zoom', () => {
    expect(
      shouldHandleCanvasWheelViewport({
        config: createCanvasAffordanceConfig({
          gestures: { pan: false, wheelZoom: true },
        }),
        input: { ...baseWheel, deltaY: 20 },
      }),
    ).toBe(false)
    expect(
      shouldHandleCanvasWheelViewport({
        config: createCanvasAffordanceConfig({
          gestures: { pan: false, wheelZoom: true },
        }),
        input: { ...baseWheel, ctrlKey: true, deltaY: 20 },
      }),
    ).toBe(true)
  })
})
