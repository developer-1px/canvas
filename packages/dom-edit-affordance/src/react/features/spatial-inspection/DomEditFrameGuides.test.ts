import { describe, expect, it } from 'vitest'
import {
  getDomEditFrameGuideGeometry,
} from './DomEditFrameGuides'

describe('DomEditFrameGuides', () => {
  it('places ruler guides in frame-local coordinates', () => {
    const geometry = getDomEditFrameGuideGeometry({
      frameRect: { h: 320, w: 480, x: 40, y: 80 },
      rulerGuides: [
        { axis: 'x', id: 'left-column', offset: 80 },
        { axis: 'y', id: 'header-baseline', offset: 110 },
      ],
      selectedRect: { h: 40, w: 120, x: 160, y: 160 },
    })

    expect(geometry.lines).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        id: 'left-column',
        length: 320,
        orientation: 'vertical',
        x: 120,
        y: 80,
      }),
      expect.objectContaining({
        axis: 'y',
        id: 'header-baseline',
        length: 480,
        orientation: 'horizontal',
        x: 40,
        y: 190,
      }),
    ]))
  })

  it('measures selected edge and center distance to ruler guides', () => {
    const geometry = getDomEditFrameGuideGeometry({
      frameRect: { h: 320, w: 480, x: 40, y: 80 },
      rulerGuides: [
        { axis: 'x', id: 'left-column', offset: 80 },
        { axis: 'y', id: 'header-baseline', offset: 110 },
      ],
      selectedRect: { h: 40, w: 120, x: 160, y: 160 },
    })

    expect(geometry.distances).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        from: 120,
        guideId: 'left-column',
        length: 40,
        orientation: 'horizontal',
        point: 'left',
      }),
      expect.objectContaining({
        axis: 'y',
        from: 180,
        guideId: 'header-baseline',
        length: 10,
        orientation: 'vertical',
        point: 'center-y',
      }),
    ]))
  })

  it('resizes layout columns with the frame width', () => {
    const baseGeometry = getDomEditFrameGuideGeometry({
      frameRect: { h: 320, w: 480, x: 40, y: 80 },
      layoutColumns: { count: 4, gutter: 16, margin: 32 },
      selectedRect: { h: 40, w: 120, x: 160, y: 160 },
    })
    const wideGeometry = getDomEditFrameGuideGeometry({
      frameRect: { h: 320, w: 720, x: 40, y: 80 },
      layoutColumns: { count: 4, gutter: 16, margin: 32 },
      selectedRect: { h: 40, w: 120, x: 160, y: 160 },
    })

    expect(baseGeometry.columns).toHaveLength(4)
    expect(wideGeometry.columns).toHaveLength(4)
    expect(baseGeometry.columns[0]).toEqual(expect.objectContaining({
      h: 320,
      w: 92,
      x: 72,
      y: 80,
    }))
    expect(wideGeometry.columns[0]).toEqual(expect.objectContaining({
      h: 320,
      w: 152,
      x: 72,
      y: 80,
    }))
  })
})
