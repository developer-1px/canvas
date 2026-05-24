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

  it('passes transient emote bursts through the overlay feature toggle', () => {
    const emoteBursts = [{
      emote: 'thumbs-up',
      id: 'emote-1',
      label: '+1',
      particles: [{ dx: 0, dy: 0 }],
      point: { x: 120, y: 80 },
    }]

    expect(createOverlay({ emoteBursts }).emoteBursts).toEqual(emoteBursts)
    expect(createOverlay({
      config: createCanvasAffordanceConfig({
        overlays: { emoteBursts: false },
      }),
      emoteBursts,
    }).emoteBursts).toEqual([])
  })
})

function createOverlay({
  config = createCanvasAffordanceConfig(),
  emoteBursts = [],
  presence = [],
}: {
  config?: ReturnType<typeof createCanvasAffordanceConfig>
  emoteBursts?: Parameters<typeof createCanvasOverlayState>[0]['emoteBursts']
  presence?: Parameters<typeof createCanvasOverlayState>[0]['presence']
} = {}) {
  return createCanvasOverlayState({
    config,
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    emoteBursts,
    laserTrail: null,
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
