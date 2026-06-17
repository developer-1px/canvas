import { describe, expect, it } from 'vitest'
import {
  createCanvasCssBoundsTransform,
  createCanvasSvgBoundsTransform,
} from './CanvasTransformPrimitives'

describe('CanvasTransformPrimitives', () => {
  it('creates CSS transforms for rotation and flips', () => {
    expect(createCanvasCssBoundsTransform({})).toBe('')
    expect(createCanvasCssBoundsTransform({
      flipX: true,
      flipY: true,
      rotation: 45,
    })).toBe('rotate(45deg) scaleX(-1) scaleY(-1)')
  })

  it('creates SVG transforms around the bounds center', () => {
    expect(createCanvasSvgBoundsTransform({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
    })).toBe('')
    expect(createCanvasSvgBoundsTransform({
      bounds: { h: 40, w: 100, x: 10, y: 20 },
      flipX: true,
      rotation: 30,
    })).toBe('translate(60 40) rotate(30) scale(-1 1) translate(-60 -40)')
  })

  it('normalizes non-finite transform numbers', () => {
    expect(createCanvasCssBoundsTransform({
      rotation: Number.NaN,
    })).toBe('')
    expect(createCanvasSvgBoundsTransform({
      bounds: { h: 3, w: 5, x: -2, y: -1 },
      flipY: true,
      rotation: Number.POSITIVE_INFINITY,
    })).toBe('translate(0.5 0.5) scale(1 -1) translate(-0.5 -0.5)')
  })
})
