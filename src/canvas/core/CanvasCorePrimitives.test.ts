import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  CANVAS_FIT_VIEWPORT_PADDING,
  CANVAS_ZOOM_STEPS,
  fitBoundsIntoViewport,
  getCanvasViewportScale,
  getCanvasViewportScreenBounds,
  getCanvasViewportScreenPoint,
  getCanvasViewportWorldBounds,
  getCanvasViewportWorldPoint,
  getCanvasViewportZoomStep,
  getCanvasViewportZoomStepMultiplier,
  MAX_SCALE,
  MIN_SCALE,
  unique,
  zoomViewport,
} from './CanvasCorePrimitives'

describe('CanvasCorePrimitives', () => {
  it('keeps product-grade zoom steps as the viewport scale contract', () => {
    expect(CANVAS_ZOOM_STEPS).toEqual([0.1, 0.25, 0.5, 1, 2, 4, 8])
    expect(MIN_SCALE).toBe(0.1)
    expect(MAX_SCALE).toBe(8)
  })

  it('dedupes ids while preserving literal id types', () => {
    const ids = ['shape-fill', 'shape-fill', 'line-style'] as const
    const deduped = unique(ids)

    expect(deduped).toEqual(['shape-fill', 'line-style'])
    expectTypeOf(deduped).toEqualTypeOf<Array<'shape-fill' | 'line-style'>>()
  })

  it('moves zoom controls to the next or previous reference step', () => {
    expect(getCanvasViewportZoomStep(1, 'in')).toBe(2)
    expect(getCanvasViewportZoomStep(1, 'out')).toBe(0.5)
    expect(getCanvasViewportZoomStep(1.2, 'in')).toBe(2)
    expect(getCanvasViewportZoomStep(1.2, 'out')).toBe(1)
    expect(getCanvasViewportZoomStep(0.1, 'out')).toBe(0.1)
    expect(getCanvasViewportZoomStep(8, 'in')).toBe(8)
  })

  it('derives zoom step multipliers from the current scale', () => {
    expect(getCanvasViewportZoomStepMultiplier(1, 'in')).toBe(2)
    expect(getCanvasViewportZoomStepMultiplier(1, 'out')).toBe(0.5)
    expect(getCanvasViewportZoomStepMultiplier(0.1, 'in')).toBe(2.5)
  })

  it('projects viewport points to finite world coordinates', () => {
    expect(
      getCanvasViewportWorldPoint(
        { scale: 2, x: 10, y: 20 },
        { x: 50, y: 80 },
      ),
    ).toEqual({ x: 20, y: 30 })
    expect(
      getCanvasViewportWorldPoint(
        { scale: Number.NaN, x: Number.NaN, y: Number.NaN },
        { x: 120, y: 80 },
      ),
    ).toEqual({ x: 1200, y: 800 })
  })

  it('projects world points to finite viewport coordinates', () => {
    expect(
      getCanvasViewportScreenPoint(
        { scale: 2, x: 10, y: 20 },
        { x: 20, y: 30 },
      ),
    ).toEqual({ x: 50, y: 80 })
    expect(
      getCanvasViewportScreenPoint(
        { scale: Number.NaN, x: Number.NaN, y: Number.NaN },
        { x: 120, y: 80 },
      ),
    ).toEqual({ x: 12, y: 8 })
  })

  it('projects viewport rects into visible world bounds', () => {
    expect(
      getCanvasViewportWorldBounds(
        { scale: 2, x: -200, y: -100 },
        { height: 600, width: 900 },
      ),
    ).toEqual({
      h: 300,
      w: 450,
      x: 100,
      y: 50,
    })
  })

  it('projects world bounds into viewport bounds', () => {
    expect(
      getCanvasViewportScreenBounds(
        { scale: 2, x: 5, y: 7 },
        { h: 30, w: 80, x: 10, y: 20 },
      ),
    ).toEqual({
      h: 60,
      w: 160,
      x: 25,
      y: 47,
    })
  })

  it('normalizes invalid viewport scale through the shared scale contract', () => {
    expect(getCanvasViewportScale({ scale: Number.NaN })).toBe(MIN_SCALE)
  })

  it('keeps zoom viewport math finite when persisted scale is invalid', () => {
    expect(
      zoomViewport({ scale: 0, x: 10, y: 20 }, { x: 20, y: 40 }, 2),
    ).toEqual({
      scale: 0.2,
      x: 0,
      y: 0,
    })

    expect(
      zoomViewport({ scale: Number.NaN, x: 10, y: 20 }, { x: 20, y: 40 }, 2),
    ).toEqual({
      scale: 0.2,
      x: 0,
      y: 0,
    })
  })

  it('fits bounds with the shared viewport padding and scale clamp', () => {
    const viewport = fitBoundsIntoViewport(
      { h: 10, w: 10, x: 0, y: 0 },
      { height: 400, width: 600 },
    )

    expect(CANVAS_FIT_VIEWPORT_PADDING).toBe(96)
    expect(viewport.scale).toBe(MAX_SCALE)
  })
})
