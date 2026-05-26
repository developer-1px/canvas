import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  previewCanvasPointerPanInteraction,
  startCanvasPointerPanInteraction,
} from './CanvasPointerPanInteraction'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerPanInteraction', () => {
  it('starts pan interactions from the pointer and viewport origin', () => {
    expect(
      startCanvasPointerPanInteraction({
        input: createPointerInput({ pointerId: 7 }),
        startScreen: { x: 10, y: 20 },
        viewport: { scale: 2, x: 100, y: 200 },
      }),
    ).toEqual({
      capturePointer: true,
      gesture: 'pan',
      interaction: {
        kind: 'pan',
        origin: { scale: 2, x: 100, y: 200 },
        pointerId: 7,
        startScreen: { x: 10, y: 20 },
      },
    })
  })

  it('previews pan viewport movement from screen delta', () => {
    expect(
      previewCanvasPointerPanInteraction({
        config,
        currentScreen: { x: 35, y: 5 },
        interaction: {
          kind: 'pan',
          origin: { scale: 2, x: 100, y: 200 },
          pointerId: 7,
          startScreen: { x: 10, y: 20 },
        },
      }),
    ).toEqual({
      kind: 'preview',
      snapGuides: {
        alignmentGuides: [],
        spacingGuides: [],
      },
      viewport: { scale: 2, x: 125, y: 185 },
    })
  })

  it('does not preview pan when the gesture is disabled', () => {
    expect(
      previewCanvasPointerPanInteraction({
        config: createCanvasAffordanceConfig({
          gestures: { pan: false },
        }),
        currentScreen: { x: 35, y: 5 },
        interaction: {
          kind: 'pan',
          origin: { scale: 2, x: 100, y: 200 },
          pointerId: 7,
          startScreen: { x: 10, y: 20 },
        },
      }),
    ).toEqual({ kind: 'none' })
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
