import { describe, expect, it } from 'vitest'
import { intersectDomEditOverflowRects } from './DomEditOverflowGeometry'

describe('intersectDomEditOverflowRects', () => {
  it('returns the selected visible rect inside a clip boundary', () => {
    expect(intersectDomEditOverflowRects(
      { h: 80, w: 120, x: 40, y: 90 },
      { h: 100, w: 100, x: 20, y: 20 },
    )).toEqual({ h: 30, w: 80, x: 40, y: 90 })
  })

  it('returns null when the selected rect is fully clipped', () => {
    expect(intersectDomEditOverflowRects(
      { h: 20, w: 50, x: 140, y: 40 },
      { h: 100, w: 100, x: 20, y: 20 },
    )).toBeNull()
  })
})
