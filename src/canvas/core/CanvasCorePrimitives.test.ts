import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  CANVAS_FIT_VIEWPORT_PADDING,
  CANVAS_ZOOM_STEPS,
  clampCanvasBoundsToFrame,
  clampCanvasPointToBounds,
  createCanvasSequentialIdFactory,
  fitBoundsIntoViewport,
  getCanvasBoundsAnchorPoint,
  getCanvasBoundsAnchorPoints,
  getCanvasBoundsCenter,
  getCanvasPointBounds,
  getCanvasViewportScale,
  getCanvasViewportScreenBounds,
  getCanvasViewportScreenPoint,
  getCanvasViewportWorldBounds,
  getCanvasViewportWorldPoint,
  getCanvasViewportZoomStep,
  getCanvasViewportZoomStepMultiplier,
  MAX_SCALE,
  MIN_SCALE,
  normalizeCanvasPointsToLocalBounds,
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

  it('creates sequential ids without colliding with existing or generated ids', () => {
    const createId = createCanvasSequentialIdFactory({
      existingIds: ['rect-1', 'rect-2'],
    })

    expect(createId('rect')).toBe('rect-3')
    expect(createId('rect')).toBe('rect-4')
    expect(createId('text')).toBe('text-5')
  })

  it('supports scoped id formats and normalizes invalid start indexes', () => {
    const createId = createCanvasSequentialIdFactory({
      existingIds: ['slide-1-text-1'],
      formatId: ({ index, prefix }) => `slide-1-${prefix}-${index}`,
      startIndex: 0.2,
    })

    expect(createId('text')).toBe('slide-1-text-2')
    expect(createId('image')).toBe('slide-1-image-3')
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

  it('computes the center point for bounds without requiring canvas items', () => {
    expect(getCanvasBoundsCenter({ h: 20, w: 40, x: 10, y: 30 })).toEqual({
      x: 30,
      y: 40,
    })
  })

  it('clamps a point into bounds without requiring canvas items', () => {
    expect(
      clampCanvasPointToBounds(
        { x: -20, y: 200 },
        { h: 120, w: 200, x: 10, y: 20 },
      ),
    ).toEqual({
      x: 10,
      y: 140,
    })

    expect(
      clampCanvasPointToBounds(
        { x: 100, y: 80 },
        { h: 120, w: 200, x: 10, y: 20 },
      ),
    ).toEqual({
      x: 100,
      y: 80,
    })
  })

  it('computes point-list bounds without requiring canvas items', () => {
    expect(
      getCanvasPointBounds([
        { x: 30, y: 90 },
        { x: 10, y: 20 },
        { x: 80, y: 40 },
      ]),
    ).toEqual({
      h: 70,
      w: 70,
      x: 10,
      y: 20,
    })

    expect(getCanvasPointBounds([], { x: 12, y: 34 })).toEqual({
      h: 0,
      w: 0,
      x: 12,
      y: 34,
    })
  })

  it('normalizes world points into padded local bounds inside a frame', () => {
    expect(
      normalizeCanvasPointsToLocalBounds({
        frame: { h: 100, w: 100, x: 0, y: 0 },
        minHeight: 16,
        minWidth: 16,
        padding: 8,
        points: [
          { x: -20, y: 40 },
          { x: 30, y: 90 },
        ],
      }),
    ).toEqual({
      bounds: {
        h: 66,
        w: 46,
        x: 0,
        y: 32,
      },
      points: [
        { x: 0, y: 8 },
        { x: 30, y: 58 },
      ],
    })
  })

  it('normalizes empty point lists through a fallback point', () => {
    expect(
      normalizeCanvasPointsToLocalBounds({
        fallbackPoint: { x: 50, y: 60 },
        frame: { h: 100, w: 100, x: 0, y: 0 },
        minHeight: 16,
        minWidth: 16,
        padding: 8,
        points: [],
      }),
    ).toEqual({
      bounds: {
        h: 16,
        w: 16,
        x: 42,
        y: 52,
      },
      points: [
        { x: 8, y: 8 },
      ],
    })
  })

  it('computes named connector anchor points for bounds', () => {
    const bounds = { h: 20, w: 40, x: 10, y: 30 }

    expect(getCanvasBoundsAnchorPoint(bounds, 'left')).toEqual({ x: 10, y: 40 })
    expect(getCanvasBoundsAnchorPoint(bounds, 'right')).toEqual({ x: 50, y: 40 })
    expect(getCanvasBoundsAnchorPoint(bounds, 'top')).toEqual({ x: 30, y: 30 })
    expect(getCanvasBoundsAnchorPoint(bounds, 'bottom')).toEqual({ x: 30, y: 50 })
    expect(getCanvasBoundsAnchorPoint(bounds, 'center')).toEqual({ x: 30, y: 40 })
    expect(getCanvasBoundsAnchorPoints(bounds)).toEqual({
      bottom: { x: 30, y: 50 },
      center: { x: 30, y: 40 },
      left: { x: 10, y: 40 },
      right: { x: 50, y: 40 },
      top: { x: 30, y: 30 },
    })
  })

  it('clamps bounds size and position into a frame', () => {
    expect(
      clampCanvasBoundsToFrame({
        bounds: { h: 1000, w: 1000, x: -20, y: 120 },
        frame: { h: 120, w: 200, x: 10, y: 20 },
        minHeight: 24,
        minWidth: 24,
      }),
    ).toEqual({
      h: 120,
      w: 200,
      x: 10,
      y: 20,
    })

    expect(
      clampCanvasBoundsToFrame({
        bounds: { h: 4, w: 6, x: 190, y: 130 },
        frame: { h: 120, w: 200, x: 10, y: 20 },
        minHeight: 24,
        minWidth: 24,
      }),
    ).toEqual({
      h: 24,
      w: 24,
      x: 186,
      y: 116,
    })
  })
})
