import { describe, expect, it } from 'vitest'

import {
  getDomEditBoxModelRects,
  readDomEditBoxModelMetrics,
  type DomEditBoxModelMetrics,
} from './DomEditBoxModelGeometry'

describe('DomEditBoxModelGeometry', () => {
  it('reads computed CSS box model values', () => {
    expect(readDomEditBoxModelMetrics({
      borderBottomWidth: '4px',
      borderLeftWidth: '1px',
      borderRightWidth: '3px',
      borderTopWidth: '2px',
      marginBottom: '8px',
      marginLeft: '5px',
      marginRight: '7px',
      marginTop: '6px',
      paddingBottom: '12px',
      paddingLeft: '9px',
      paddingRight: '11px',
      paddingTop: '10px',
    })).toEqual({
      border: { bottom: 4, left: 1, right: 3, top: 2 },
      margin: { bottom: 8, left: 5, right: 7, top: 6 },
      padding: { bottom: 12, left: 9, right: 11, top: 10 },
    })
  })

  it('computes content, padding, border, and margin rects', () => {
    const rects = getDomEditBoxModelRects({
      metrics: {
        border: { bottom: 4, left: 1, right: 3, top: 2 },
        margin: { bottom: 8, left: 5, right: 7, top: 6 },
        padding: { bottom: 12, left: 9, right: 11, top: 10 },
      },
      rect: { h: 80, scale: 1, w: 100, x: 20, y: 30 },
    })

    expect(rects.border).toEqual({ h: 80, scale: 1, w: 100, x: 20, y: 30 })
    expect(rects.content).toEqual({ h: 52, scale: 1, w: 76, x: 30, y: 42 })
    expect(rects.padding.find((item) => item.side === 'left')).toMatchObject({
      h: 74,
      w: 9,
      x: 21,
      y: 32,
    })
    expect(rects.margin.find((item) => item.side === 'top')).toMatchObject({
      h: 6,
      w: 112,
      x: 15,
      y: 24,
    })
  })

  it('keeps zero-size layers valid', () => {
    const metrics: DomEditBoxModelMetrics = {
      border: { bottom: 0, left: 0, right: 0, top: 0 },
      margin: { bottom: 0, left: 0, right: 0, top: 0 },
      padding: { bottom: 0, left: 0, right: 0, top: 0 },
    }
    const rects = getDomEditBoxModelRects({
      metrics,
      rect: { h: 24, scale: 1, w: 40, x: 10, y: 10 },
    })

    expect(rects.content).toEqual({ h: 24, scale: 1, w: 40, x: 10, y: 10 })
    expect(rects.padding).toHaveLength(4)
    expect(rects.margin).toHaveLength(4)
    expect(rects.padding.every((item) => item.h >= 0 && item.w >= 0))
      .toBe(true)
    expect(rects.margin.every((item) => item.h >= 0 && item.w >= 0))
      .toBe(true)
  })
})
