import { describe, expect, it } from 'vitest'

import { getDomEditGridChildArea } from './DomEditGridChildGeometry'

describe('DomEditGridChildGeometry', () => {
  const tracks = [
    { h: 40, w: 80, x: 0, y: 0 },
    { h: 40, w: 80, x: 96, y: 0 },
    { h: 40, w: 80, x: 0, y: 56 },
    { h: 40, w: 80, x: 96, y: 56 },
  ]

  it('matches a child to a single occupied grid cell', () => {
    expect(getDomEditGridChildArea({
      child: { h: 40, w: 80, x: 96, y: 56 },
      tracks,
    })).toMatchObject({
      columnEnd: 2,
      columnSpan: 1,
      columnStart: 1,
      rowEnd: 2,
      rowSpan: 1,
      rowStart: 1,
      x: 96,
      y: 56,
    })
  })

  it('distinguishes multi-track spans', () => {
    expect(getDomEditGridChildArea({
      child: { h: 40, w: 176, x: 0, y: 0 },
      tracks,
    })).toMatchObject({
      columnEnd: 2,
      columnSpan: 2,
      columnStart: 0,
      rowSpan: 1,
      w: 176,
    })
  })

  it('returns null when the child does not match track lines', () => {
    expect(getDomEditGridChildArea({
      child: { h: 39, w: 77, x: 13, y: 3 },
      tracks,
    })).toBeNull()
  })
})
