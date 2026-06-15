import { describe, expect, it } from 'vitest'

import { getDomEditFlexWrapLayout } from './DomEditFlexWrapGeometry'

describe('DomEditFlexWrapGeometry', () => {
  it('groups row-wrap children into horizontal lines', () => {
    const layout = getDomEditFlexWrapLayout({
      children: [
        { h: 24, w: 80, x: 0, y: 0 },
        { h: 24, w: 72, x: 88, y: 0 },
        { h: 24, w: 90, x: 0, y: 36 },
      ],
      container: { h: 60, w: 180, x: 0, y: 0 },
      direction: 'row',
      gap: 12,
    })

    expect(layout?.lines).toMatchObject([
      { h: 24, index: 0, w: 180, x: 0, y: 0 },
      { h: 24, index: 1, w: 180, x: 0, y: 36 },
    ])
    expect(layout?.gaps).toMatchObject([
      { axis: 'row', h: 12, label: 'row gap 12', y: 24 },
    ])
  })

  it('groups column-wrap children into vertical lines', () => {
    const layout = getDomEditFlexWrapLayout({
      children: [
        { h: 64, w: 36, x: 0, y: 0 },
        { h: 42, w: 36, x: 0, y: 72 },
        { h: 80, w: 36, x: 48, y: 0 },
      ],
      container: { h: 120, w: 84, x: 0, y: 0 },
      direction: 'column',
      gap: 12,
    })

    expect(layout?.lines).toMatchObject([
      { h: 120, index: 0, w: 36, x: 0, y: 0 },
      { h: 120, index: 1, w: 36, x: 48, y: 0 },
    ])
    expect(layout?.gaps).toMatchObject([
      { axis: 'column', label: 'col gap 12', w: 12, x: 36 },
    ])
  })

  it('returns null when children stay on one flex line', () => {
    expect(getDomEditFlexWrapLayout({
      children: [
        { h: 24, w: 80, x: 0, y: 0 },
        { h: 24, w: 72, x: 88, y: 0 },
      ],
      container: { h: 24, w: 180, x: 0, y: 0 },
      direction: 'row',
      gap: 8,
    })).toBeNull()
  })
})
