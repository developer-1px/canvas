import { describe, expect, it } from 'vitest'

import {
  getSlideEditFrameGuideGeometry,
  normalizeSlideEditFrameInsets,
} from './SlideEditFrameGuides'

describe('SlideEditFrameGuides', () => {
  it('computes center, margin, and safe-area guide geometry from frame bounds', () => {
    const geometry = getSlideEditFrameGuideGeometry({
      frameBounds: { h: 450, w: 800, x: 100, y: 40 },
      config: {
        margin: 40,
        safeArea: {
          bottom: 70,
          left: 80,
          right: 80,
          top: 60,
        },
      },
    })

    expect(geometry.lines).toEqual(expect.arrayContaining([
      expect.objectContaining({
        axis: 'x',
        coordinate: 500,
        frameOffset: 400,
        id: 'center-x',
        kind: 'center',
        orientation: 'vertical',
      }),
      expect.objectContaining({
        axis: 'y',
        coordinate: 265,
        frameOffset: 225,
        id: 'center-y',
        kind: 'center',
        orientation: 'horizontal',
      }),
      expect.objectContaining({
        coordinate: 140,
        frameOffset: 40,
        id: 'margin-left',
        kind: 'margin',
        side: 'left',
      }),
      expect.objectContaining({
        coordinate: 860,
        frameOffset: 760,
        id: 'margin-right',
        kind: 'margin',
        side: 'right',
      }),
      expect.objectContaining({
        coordinate: 180,
        frameOffset: 80,
        id: 'safe-area-left',
        kind: 'safe-area',
      }),
    ]))
    expect(geometry.regions).toEqual([{
      h: 320,
      id: 'safe-area',
      kind: 'safe-area',
      w: 640,
      x: 180,
      y: 100,
    }])
  })

  it('represents optional ruler guides and column guides as headless data', () => {
    const geometry = getSlideEditFrameGuideGeometry({
      frameBounds: { h: 450, w: 800, x: 100, y: 40 },
      config: {
        columns: {
          count: 4,
          gutter: 20,
          margin: 60,
        },
        rulerGuides: [
          { axis: 'x', id: 'ruler-left-title', offset: 120 },
          { axis: 'y', id: 'ruler-fold', offset: 500 },
        ],
      },
    })

    expect(geometry.lines).toEqual(expect.arrayContaining([
      expect.objectContaining({
        coordinate: 220,
        frameOffset: 120,
        id: 'ruler-left-title',
        kind: 'ruler',
      }),
    ]))
    expect(geometry.lines.some((line) => line.id === 'ruler-fold')).toBe(false)
    expect(geometry.columns).toEqual([
      {
        h: 450,
        id: 'column-1',
        index: 0,
        kind: 'column',
        w: 155,
        x: 160,
        y: 40,
      },
      {
        h: 450,
        id: 'column-2',
        index: 1,
        kind: 'column',
        w: 155,
        x: 335,
        y: 40,
      },
      {
        h: 450,
        id: 'column-3',
        index: 2,
        kind: 'column',
        w: 155,
        x: 510,
        y: 40,
      },
      {
        h: 450,
        id: 'column-4',
        index: 3,
        kind: 'column',
        w: 155,
        x: 685,
        y: 40,
      },
    ])
  })

  it('normalizes symmetric and explicit inset input', () => {
    expect(normalizeSlideEditFrameInsets(24)).toEqual({
      bottom: 24,
      left: 24,
      right: 24,
      top: 24,
    })
    expect(normalizeSlideEditFrameInsets({
      bottom: Number.POSITIVE_INFINITY,
      left: -10,
      right: 32,
      top: 16,
    })).toEqual({
      bottom: 0,
      left: 0,
      right: 32,
      top: 16,
    })
  })

  it('keeps frame guide geometry independent of DOM and React concepts', () => {
    const geometry = getSlideEditFrameGuideGeometry({
      frameBounds: { h: 450, w: 800, x: 100, y: 40 },
      config: {
        columns: { count: 2, gutter: 24, margin: 48 },
        margin: 24,
        rulerGuides: [{ axis: 'x', id: 'ruler-a', offset: 300 }],
        safeArea: 60,
      },
    })
    const contractStrings = JSON.stringify(geometry).toLowerCase()

    expect(contractStrings).not.toContain('dom')
    expect(contractStrings).not.toContain('element')
    expect(contractStrings).not.toContain('react')
  })
})
