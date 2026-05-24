import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  previewCanvasPointerLaserInteraction,
  startCanvasPointerLaserInteraction,
} from './CanvasPointerLaser'

const input = createPointerInput()

describe('CanvasPointerLaser', () => {
  it('starts an ephemeral laser interaction with an initial trail', () => {
    expect(startCanvasPointerLaserInteraction({
      config: createCanvasAffordanceConfig(),
      input,
      pointerGesture: 'laser',
      startScreen: { x: 10, y: 20 },
      startWorld: { x: 30, y: 40 },
    })).toEqual({
      capturePointer: true,
      gesture: 'laser',
      interaction: {
        currentWorld: { x: 30, y: 40 },
        kind: 'laser',
        moved: false,
        pointerId: 1,
        points: [{ x: 30, y: 40 }],
        startScreen: { x: 10, y: 20 },
        startWorld: { x: 30, y: 40 },
      },
      kind: 'interaction',
      laserTrail: {
        points: [{ x: 30, y: 40 }],
      },
    })
  })

  it('previews the trail without producing document items', () => {
    const result = previewCanvasPointerLaserInteraction({
      config: createCanvasAffordanceConfig(),
      currentScreen: { x: 20, y: 40 },
      currentWorld: { x: 50, y: 70 },
      interaction: {
        currentWorld: { x: 30, y: 40 },
        kind: 'laser',
        moved: false,
        pointerId: 1,
        points: [{ x: 30, y: 40 }],
        startScreen: { x: 10, y: 20 },
        startWorld: { x: 30, y: 40 },
      },
    })

    expect(result).toMatchObject({
      interaction: {
        currentWorld: { x: 50, y: 70 },
        kind: 'laser',
        moved: true,
        points: [{ x: 30, y: 40 }, { x: 50, y: 70 }],
      },
      kind: 'preview',
      laserTrail: {
        points: [{ x: 30, y: 40 }, { x: 50, y: 70 }],
      },
      snapGuides: {
        alignmentGuides: [],
        spacingGuides: [],
      },
    })
  })

  it('honors the laser pointer gesture toggle', () => {
    const config = createCanvasAffordanceConfig({
      gestures: { laserPointer: false },
    })

    expect(startCanvasPointerLaserInteraction({
      config,
      input,
      pointerGesture: 'laser',
      startScreen: { x: 0, y: 0 },
      startWorld: { x: 0, y: 0 },
    })).toEqual({ kind: 'none' })
  })
})

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
