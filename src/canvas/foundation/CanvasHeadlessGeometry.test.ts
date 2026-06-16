import { describe, expect, it } from 'vitest'
import {
  getCanvasLocalRect,
  getCanvasRectEdgeDistances,
  normalizeCanvasRect,
  padCanvasRect,
  unionCanvasRectList,
  unionCanvasRects,
} from './CanvasHeadlessGeometry'

describe('CanvasHeadlessGeometry', () => {
  it('normalizes, pads, and unions generic measured rects', () => {
    expect(normalizeCanvasRect({ h: 0, w: -4, x: 10, y: 20 })).toEqual({
      h: 1,
      w: 1,
      x: 10,
      y: 20,
    })
    expect(padCanvasRect({ h: 30, w: 40, x: 10, y: 20 }, 6)).toEqual({
      h: 42,
      w: 52,
      x: 4,
      y: 14,
    })
    expect(
      unionCanvasRects(
        { h: 30, w: 40, x: 10, y: 20 },
        { h: 12, w: 18, x: 80, y: 12 },
      ),
    ).toEqual({
      h: 38,
      w: 88,
      x: 10,
      y: 12,
    })
    expect(unionCanvasRectList([])).toBeNull()
  })

  it('converts screen rects into a local overlay coordinate space', () => {
    expect(getCanvasLocalRect({
      origin: { height: 600, left: 100, top: 50, width: 900 },
      rect: { height: 30, left: 140, top: 90, width: 80 },
    })).toEqual({
      h: 30,
      w: 80,
      x: 40,
      y: 40,
    })
  })

  it('measures edge distances for separated and overlapping rects', () => {
    expect(getCanvasRectEdgeDistances(
      { h: 40, w: 60, x: 10, y: 20 },
      { h: 20, w: 30, x: 100, y: 30 },
    )).toEqual([{
      axis: 'x',
      from: { x: 70, y: 40 },
      length: 30,
    }])
    expect(getCanvasRectEdgeDistances(
      { h: 40, w: 60, x: 10, y: 20 },
      { h: 20, w: 30, x: 30, y: 100 },
    )).toEqual([{
      axis: 'y',
      from: { x: 45, y: 60 },
      length: 40,
    }])
    expect(getCanvasRectEdgeDistances(
      { h: 40, w: 60, x: 10, y: 20 },
      { h: 20, w: 30, x: 20, y: 30 },
    )).toEqual([{
      axis: 'x',
      from: { x: 35, y: 40 },
      length: 5,
    }])
  })
})
