import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import { createCanvasOverlayState } from './CanvasOverlayEngine'

describe('CanvasOverlayEngine', () => {
  it('passes collaborator presence through the overlay feature toggle', () => {
    const presence = [{
      color: '#2563eb',
      id: 'mia',
      label: 'Mia',
      point: { x: 120, y: 80 },
      selectionBounds: { h: 40, w: 80, x: 32, y: 48 },
    }]

    expect(createOverlay({ presence }).presence).toEqual(presence)
    expect(createOverlay({
      config: createCanvasAffordanceConfig({
        overlays: { presence: false },
      }),
      presence,
    }).presence).toEqual([])
  })
})

function createOverlay({
  config = createCanvasAffordanceConfig(),
  presence = [],
}: {
  config?: ReturnType<typeof createCanvasAffordanceConfig>
  presence?: Parameters<typeof createCanvasOverlayState>[0]['presence']
} = {}) {
  return createCanvasOverlayState({
    config,
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    marquee: null,
    presence,
    scene: {
      entries: [],
      getBounds: () => null,
      getParentId: () => null,
      getSelectedAncestorId: () => null,
      isGroup: () => false,
    },
    selection: [],
    snapGuides: {
      alignmentGuides: [],
      spacingGuides: [],
    },
    viewport: { scale: 1, x: 0, y: 0 },
  })
}
