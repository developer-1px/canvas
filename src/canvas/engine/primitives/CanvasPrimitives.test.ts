import { describe, expect, test } from 'vitest'
import { resizeBounds } from './CanvasPrimitives'

const bounds = { x: 0, y: 0, w: 100, h: 50 }

describe('resizeBounds', () => {
  test('resizes from the opposite handle by default', () => {
    expect(resizeBounds(bounds, 'se', { x: 200, y: 100 })).toEqual({
      x: 0,
      y: 0,
      w: 200,
      h: 100,
    })
  })

  test('preserves aspect ratio from a corner handle', () => {
    expect(
      resizeBounds(bounds, 'se', { x: 200, y: 70 }, {
        preserveAspectRatio: true,
      }),
    ).toEqual({
      x: 0,
      y: 0,
      w: 200,
      h: 100,
    })
  })

  test('preserves aspect ratio from a side handle', () => {
    expect(
      resizeBounds(bounds, 'e', { x: 200, y: 0 }, {
        preserveAspectRatio: true,
      }),
    ).toEqual({
      x: 0,
      y: -25,
      w: 200,
      h: 100,
    })
  })

  test('resizes from center with option pressed', () => {
    expect(
      resizeBounds(bounds, 'e', { x: 150, y: 0 }, {
        resizeFromCenter: true,
      }),
    ).toEqual({
      x: -50,
      y: 0,
      w: 200,
      h: 50,
    })
  })

  test('combines center resize and aspect ratio lock', () => {
    expect(
      resizeBounds(bounds, 'se', { x: 150, y: 70 }, {
        preserveAspectRatio: true,
        resizeFromCenter: true,
      }),
    ).toEqual({
      x: -50,
      y: -25,
      w: 200,
      h: 100,
    })
  })
})
