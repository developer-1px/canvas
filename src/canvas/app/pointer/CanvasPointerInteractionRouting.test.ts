import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import type { Interaction } from './CanvasInteractionState'
import { routeCanvasPointerInteraction } from './CanvasPointerInteractionRouting'

describe('CanvasPointerInteractionRouting', () => {
  it('routes standard interaction kinds behind one internal grammar seam', () => {
    expect(route(createPanInteraction())).toBe('pan:pan')
    expect(route(createMoveInteraction())).toBe('transform:move')
    expect(route(createResizeInteraction())).toBe('transform:resize')
    expect(route(createArrowEndpointInteraction()))
      .toBe('transform:arrow-endpoint')
    expect(route(createMarqueeInteraction())).toBe('marquee:marquee')
    expect(route(createLaserInteraction())).toBe('laser:laser')
    expect(route(createRectCreationInteraction())).toBe('creation:create-rect')
    expect(route({ kind: 'none' })).toBe('none:none')
  })

  it('falls back when a route does not handle a known interaction category', () => {
    expect(
      routeCanvasPointerInteraction(createPanInteraction(), {
        fallback: () => 'fallback',
        transform: (interaction) => interaction.kind,
      }),
    ).toBe('fallback')
  })
})

function route(interaction: Interaction) {
  return routeCanvasPointerInteraction(interaction, {
    creation: (interaction) => `creation:${interaction.kind}`,
    fallback: () => 'fallback',
    laser: (interaction) => `laser:${interaction.kind}`,
    marquee: (interaction) => `marquee:${interaction.kind}`,
    none: (interaction) => `none:${interaction.kind}`,
    pan: (interaction) => `pan:${interaction.kind}`,
    transform: (interaction) => `transform:${interaction.kind}`,
  })
}

function createPanInteraction(): Interaction {
  return {
    kind: 'pan',
    origin: { x: 0, y: 0, scale: 1 },
    pointerId: 1,
    startScreen: { x: 0, y: 0 },
  }
}

function createMoveInteraction(): Interaction {
  const item = createRectItem()

  return {
    bounds: { h: 20, w: 20, x: 0, y: 0 },
    currentItems: [item],
    historyItems: [item],
    historySelection: ['rect-1'],
    ids: ['rect-1'],
    kind: 'move',
    moved: false,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createResizeInteraction(): Interaction {
  const item = createRectItem()

  return {
    bounds: { h: 20, w: 20, x: 0, y: 0 },
    currentItems: [item],
    handle: 'se',
    historyItems: [item],
    ids: ['rect-1'],
    kind: 'resize',
    moved: false,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createArrowEndpointInteraction(): Interaction {
  const item = createRectItem()

  return {
    arrowId: 'arrow-1',
    currentItems: [item],
    currentWorld: { x: 0, y: 0 },
    endpoint: 'end',
    historyItems: [item],
    kind: 'arrow-endpoint',
    moved: false,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createMarqueeInteraction(): Interaction {
  return {
    additive: false,
    baseSelection: [],
    currentWorld: { x: 0, y: 0 },
    kind: 'marquee',
    moved: false,
    pointerId: 1,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createLaserInteraction(): Interaction {
  return {
    currentWorld: { x: 0, y: 0 },
    kind: 'laser',
    moved: false,
    pointerId: 1,
    points: [{ x: 0, y: 0 }],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createRectCreationInteraction(): Interaction {
  return {
    currentWorld: { x: 0, y: 0 },
    kind: 'create-rect',
    moved: false,
    pointerId: 1,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
  }
}

function createRectItem(): CanvasItem {
  return {
    fill: '#ffffff',
    h: 20,
    id: 'rect-1',
    stroke: '#111111',
    type: 'rect',
    w: 20,
    x: 0,
    y: 0,
  }
}
