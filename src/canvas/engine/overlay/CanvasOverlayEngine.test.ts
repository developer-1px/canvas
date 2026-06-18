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

  it('builds component part source outlines through the overlay feature toggle', () => {
    const componentPartSources = [{
      componentId: 'stat-card',
      componentLabel: 'Stat card',
      id: 'stat-card:value',
      itemIds: ['stat-revenue-value', 'stat-conversion-value'],
      label: 'Value',
      slotId: 'value',
    }]
    const scene = createSceneAdapter({
      'stat-conversion-value': { h: 30, w: 80, x: 180, y: 80 },
      'stat-revenue-value': { h: 20, w: 60, x: 40, y: 24 },
    })

    expect(createOverlay({
      componentPartSources,
      scene,
    }).componentPartSourceOutlines).toEqual([{
      ...componentPartSources[0],
      bounds: { h: 86, w: 220, x: 40, y: 24 },
    }])
    expect(createOverlay({
      componentPartSources,
      config: createCanvasAffordanceConfig({
        overlays: { componentPartSourceOutline: false },
      }),
      scene,
    }).componentPartSourceOutlines).toEqual([])
    expect(createOverlay({
      componentPartSources,
    }).componentPartSourceOutlines).toEqual([])
  })
})

function createOverlay({
  componentPartSources = [],
  config = createCanvasAffordanceConfig(),
  emoteBursts = [],
  presence = [],
  scene = createSceneAdapter(),
}: {
  componentPartSources?: Parameters<typeof createCanvasOverlayState>[0]['componentPartSources']
  config?: ReturnType<typeof createCanvasAffordanceConfig>
  emoteBursts?: Parameters<typeof createCanvasOverlayState>[0]['emoteBursts']
  presence?: Parameters<typeof createCanvasOverlayState>[0]['presence']
  scene?: Parameters<typeof createCanvasOverlayState>[0]['scene']
} = {}) {
  return createCanvasOverlayState({
    componentPartSources,
    config,
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    emoteBursts,
    laserTrail: null,
    marquee: null,
    presence,
    scene,
    selection: [],
    snapGuides: {
      alignmentGuides: [],
      spacingGuides: [],
    },
    viewport: { scale: 1, x: 0, y: 0 },
  })
}

function createSceneAdapter(boundsById: Record<string, {
  h: number
  w: number
  x: number
  y: number
}> = {}): Parameters<typeof createCanvasOverlayState>[0]['scene'] {
  return {
    entries: [],
    getBounds: (ids) => {
      const bounds = ids
        .map((id) => boundsById[id])
        .filter((bounds) => bounds !== undefined)

      if (bounds.length === 0) {
        return null
      }

      const minX = Math.min(...bounds.map((bounds) => bounds.x))
      const minY = Math.min(...bounds.map((bounds) => bounds.y))
      const maxX = Math.max(...bounds.map((bounds) => bounds.x + bounds.w))
      const maxY = Math.max(...bounds.map((bounds) => bounds.y + bounds.h))

      return {
        h: maxY - minY,
        w: maxX - minX,
        x: minX,
        y: minY,
      }
    },
    getParentId: () => null,
    getSelectedAncestorId: () => null,
    isGroup: () => false,
  }
}
