import { describe, expect, test } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import {
  CANVAS_WHEEL_ZOOM_DELTA_LIMIT,
  CANVAS_WHEEL_ZOOM_SENSITIVITY,
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
  test('uses ordinary wheel delta as 1:1 screen-space pan for trackpads', () => {
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
    ).toEqual({ x: -10, y: -20, scale: 1 })
  })

  test('uses shift wheel as horizontal pan for mouse wheel input', () => {
    expect(
      getCanvasWheelViewport({
        config,
        input: {
          ...baseWheel,
          deltaY: 20,
          shiftKey: true,
        },
        point: { x: 100, y: 100 },
        viewport,
      }),
    ).toEqual({ x: -20, y: 0, scale: 1 })
  })

  test('uses clamped pinch wheel input as smooth zoom around the pointer', () => {
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
    const multiplier = Math.exp(
      CANVAS_WHEEL_ZOOM_DELTA_LIMIT * CANVAS_WHEEL_ZOOM_SENSITIVITY,
    )

    expect(next?.scale).toBeCloseTo(multiplier)
    expect(next?.x).toBeCloseTo(100 - 100 * multiplier)
    expect(next?.y).toBeCloseTo(100 - 100 * multiplier)
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
