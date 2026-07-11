import { describe, expect, it } from 'vitest'

import {
  getFigmaCloneFrameGuides,
  getFigmaCloneResponsiveGuidePreset,
} from './FigmaCloneFrameGuides'

describe('canonical Figma frame guides', () => {
  it('chooses responsive columns from the authored frame width', () => {
    expect(getFigmaCloneResponsiveGuidePreset(1440)).toBe('desktop')
    expect(getFigmaCloneResponsiveGuidePreset(1280)).toBe('laptop')
    expect(getFigmaCloneResponsiveGuidePreset(768)).toBe('tablet')
    expect(getFigmaCloneResponsiveGuidePreset(390)).toBe('mobile')
  })

  it('uses canonical root identity for rulers and page-specific baselines', () => {
    const frame = {
      x: 40,
      y: 76,
      width: 390,
      height: 844,
      rotation: 0,
      widthMode: 'fixed' as const,
      heightMode: 'fixed' as const,
      overflow: 'scroll' as const,
    }

    expect(getFigmaCloneFrameGuides({ frame, rootId: 'homePage' }))
      .toEqual({
        frameNodeId: 'homePage',
        layoutColumns: { count: 4, gutter: 12, margin: 24 },
        rulerGuides: [
          {
            axis: 'x',
            id: 'homePage-mobile-safe-left',
            offset: 24,
          },
          {
            axis: 'x',
            id: 'homePage-mobile-safe-right',
            offset: 366,
          },
          {
            axis: 'y',
            id: 'homePage-mobile-content-start',
            offset: 132,
          },
        ],
      })
  })
})
