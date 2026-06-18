import { describe, expect, it } from 'vitest'
import { getCanvasClientViewportSize } from './CanvasClientViewportSize'

describe('getCanvasClientViewportSize', () => {
  it('reads width and height from a window-like source', () => {
    expect(getCanvasClientViewportSize({
      innerHeight: 720,
      innerWidth: 1280,
    })).toEqual({
      height: 720,
      width: 1280,
    })
  })

  it('normalizes negative dimensions to zero', () => {
    expect(getCanvasClientViewportSize({
      innerHeight: -10,
      innerWidth: -20,
    })).toEqual({
      height: 0,
      width: 0,
    })
  })

  it('returns null when source or dimensions are unavailable', () => {
    expect(getCanvasClientViewportSize(null)).toBeNull()
    expect(getCanvasClientViewportSize({})).toBeNull()
    expect(getCanvasClientViewportSize({
      innerHeight: Number.NaN,
      innerWidth: 1280,
    })).toBeNull()
  })
})
