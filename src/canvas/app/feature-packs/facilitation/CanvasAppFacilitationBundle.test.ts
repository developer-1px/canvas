import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  createCanvasOverlayState,
} from '../../../engine'
import type { CanvasAppPointerInput } from '../../affordances/interaction/pointer/CanvasAppPointerInput'
import {
  startCanvasPointerLaserInteraction,
} from '../../affordances/interaction/pointer/CanvasPointerLaser'
import {
  CANVAS_APP_FACILITATION_BUNDLE_ID,
  createCanvasAppFacilitationAffordanceConfigInput,
  mergeCanvasAppAffordanceConfigInput,
  withCanvasAppFacilitationBundle,
} from './CanvasAppFacilitationBundle'

describe('CanvasAppFacilitationBundle', () => {
  it('exposes facilitation affordances as a named first-party bundle', () => {
    const config = createCanvasAffordanceConfig(
      createCanvasAppFacilitationAffordanceConfigInput(),
    )

    expect(CANVAS_APP_FACILITATION_BUNDLE_ID).toBe('canvas-facilitation')
    expect(config.overlays.sessionTimer).toBe(true)
    expect(config.overlays.votingSession).toBe(true)
    expect(config.overlays.spotlight).toBe(true)
    expect(config.overlays.cursorChat).toBe(true)
    expect(config.overlays.emoteControls).toBe(true)
    expect(config.overlays.emoteBursts).toBe(true)
    expect(config.overlays.laserTrail).toBe(true)
    expect(config.shortcuts.cursorChat).toBe(true)
    expect(config.shortcuts.laserTool).toBe(true)
    expect(config.gestures.emoteBurst).toBe(true)
    expect(config.gestures.laserPointer).toBe(true)
    expect(config.tools.laser).toBe(true)
  })

  it('lets host assemblies disable facilitation without changing core affordances', () => {
    const config = createCanvasAffordanceConfig(
      withCanvasAppFacilitationBundle({
        overlays: {
          grid: true,
          toolbar: true,
        },
        tools: {
          select: true,
        },
      }, { enabled: false }),
    )

    expect(config.overlays.grid).toBe(true)
    expect(config.overlays.toolbar).toBe(true)
    expect(config.tools.select).toBe(true)
    expect(config.overlays.sessionTimer).toBe(false)
    expect(config.overlays.votingSession).toBe(false)
    expect(config.overlays.spotlight).toBe(false)
    expect(config.overlays.cursorChat).toBe(false)
    expect(config.overlays.emoteControls).toBe(false)
    expect(config.overlays.emoteBursts).toBe(false)
    expect(config.overlays.laserTrail).toBe(false)
    expect(config.shortcuts.cursorChat).toBe(false)
    expect(config.shortcuts.laserTool).toBe(false)
    expect(config.gestures.emoteBurst).toBe(false)
    expect(config.gestures.laserPointer).toBe(false)
    expect(config.tools.laser).toBe(false)
  })

  it('keeps bundle merges deterministic and caller-owned config mutable', () => {
    const callerConfig = {
      overlays: {
        grid: false,
      },
    }
    const merged = mergeCanvasAppAffordanceConfigInput(
      createCanvasAppFacilitationAffordanceConfigInput({ enabled: false }),
      callerConfig,
    )

    callerConfig.overlays.grid = true

    expect(merged.overlays?.grid).toBe(false)
    expect(merged.overlays?.sessionTimer).toBe(false)
  })

  it('gates facilitation overlays and pointer behavior consistently', () => {
    const disabledConfig = createCanvasAffordanceConfig(
      createCanvasAppFacilitationAffordanceConfigInput({ enabled: false }),
    )
    const enabledConfig = createCanvasAffordanceConfig(
      createCanvasAppFacilitationAffordanceConfigInput({ enabled: true }),
    )
    const emoteBursts = [{
      emote: 'thumbs-up',
      id: 'emote-1',
      label: '+1',
      particles: [{ dx: 0, dy: 0 }],
      point: { x: 120, y: 80 },
    }]
    const laserTrail = {
      points: [{ x: 12, y: 24 }],
    }

    expect(createOverlay({
      config: disabledConfig,
      emoteBursts,
      laserTrail,
    })).toMatchObject({
      emoteBursts: [],
      laserTrail: null,
    })
    expect(createOverlay({
      config: enabledConfig,
      emoteBursts,
      laserTrail,
    })).toMatchObject({
      emoteBursts,
      laserTrail,
    })
    expect(startCanvasPointerLaserInteraction({
      config: disabledConfig,
      input: createPointerInput(),
      pointerGesture: 'laser',
      startScreen: { x: 0, y: 0 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ kind: 'none' })
    expect(startCanvasPointerLaserInteraction({
      config: enabledConfig,
      input: createPointerInput(),
      pointerGesture: 'laser',
      startScreen: { x: 0, y: 0 },
      startWorld: { x: 0, y: 0 },
    })).toMatchObject({
      gesture: 'laser',
      kind: 'interaction',
      laserTrail: {
        points: [{ x: 0, y: 0 }],
      },
    })
  })
})

function createOverlay({
  config,
  emoteBursts = [],
  laserTrail = null,
}: {
  config: ReturnType<typeof createCanvasAffordanceConfig>
  emoteBursts?: Parameters<typeof createCanvasOverlayState>[0]['emoteBursts']
  laserTrail?: Parameters<typeof createCanvasOverlayState>[0]['laserTrail']
}) {
  return createCanvasOverlayState({
    config,
    draftArrow: null,
    draftRect: null,
    draftStroke: null,
    emoteBursts,
    laserTrail,
    marquee: null,
    presence: [],
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

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}
