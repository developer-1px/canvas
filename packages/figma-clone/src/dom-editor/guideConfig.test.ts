import { describe, expect, it } from 'vitest'
import {
  getFigmaCloneDomFrameGuides,
  getFigmaCloneResponsiveGuidePreset,
} from './guideConfig'

describe('getFigmaCloneResponsiveGuidePreset', () => {
  it('maps section viewport widths to responsive guide presets', () => {
    expect(getFigmaCloneResponsiveGuidePreset({ w: 1440 })).toBe('desktop')
    expect(getFigmaCloneResponsiveGuidePreset({ w: 1280 })).toBe('laptop')
    expect(getFigmaCloneResponsiveGuidePreset({ w: 768 })).toBe('tablet')
    expect(getFigmaCloneResponsiveGuidePreset({ w: 390 })).toBe('mobile')
  })
})

describe('getFigmaCloneDomFrameGuides', () => {
  it('returns desktop columns and safe-area guides', () => {
    expect(getFigmaCloneDomFrameGuides({
      rootId: 'workspacePage',
      sectionViewport: {
        frameMode: 'page',
        h: 900,
        overflow: 'scroll',
        w: 1440,
      },
    })).toMatchObject({
      frameNodeId: 'workspacePage',
      layoutColumns: { count: 12, gutter: 24, margin: 80 },
      rulerGuides: [
        { axis: 'x', offset: 80 },
        { axis: 'x', offset: 1360 },
        { axis: 'y', offset: 132 },
      ],
    })
  })

  it('returns mobile content columns and safe-area guides', () => {
    expect(getFigmaCloneDomFrameGuides({
      rootId: 'workspacePage',
      sectionViewport: {
        frameMode: 'mock',
        h: 844,
        overflow: 'clip',
        w: 390,
      },
    })).toMatchObject({
      layoutColumns: { count: 4, gutter: 12, margin: 24 },
      rulerGuides: [
        { axis: 'x', offset: 24 },
        { axis: 'x', offset: 366 },
        { axis: 'y', offset: 96 },
      ],
    })
  })
})
