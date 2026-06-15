import { describe, expect, it } from 'vitest'
import { getDomEditMeasurementDistances } from './DomEditMeasurementGeometry'

describe('getDomEditMeasurementDistances', () => {
  it('returns a sibling gap distance on the separated axis', () => {
    expect(getDomEditMeasurementDistances(
      { h: 80, w: 100, x: 20, y: 40 },
      { h: 80, w: 100, x: 152, y: 40 },
    )).toEqual([{
      axis: 'x',
      from: { x: 120, y: 80 },
      kind: 'gap',
      length: 32,
    }])
  })

  it('returns parent inset distances when the selected rect is inside reference', () => {
    expect(getDomEditMeasurementDistances(
      { h: 40, w: 60, x: 44, y: 56 },
      { h: 120, w: 160, x: 20, y: 20 },
    )).toEqual([
      { axis: 'y', from: { x: 74, y: 20 }, kind: 'inset', length: 36 },
      { axis: 'y', from: { x: 74, y: 96 }, kind: 'inset', length: 44 },
      { axis: 'x', from: { x: 20, y: 76 }, kind: 'inset', length: 24 },
      { axis: 'x', from: { x: 104, y: 76 }, kind: 'inset', length: 76 },
    ])
  })

  it('returns overlap inset distances instead of a gap for intersecting rects', () => {
    expect(getDomEditMeasurementDistances(
      { h: 60, w: 80, x: 20, y: 20 },
      { h: 60, w: 80, x: 70, y: 40 },
    )).toEqual([
      { axis: 'x', from: { x: 70, y: 60 }, kind: 'inset', length: 30 },
      { axis: 'y', from: { x: 85, y: 40 }, kind: 'inset', length: 40 },
    ])
  })
})
