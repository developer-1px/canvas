import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import { createCanvasAffordanceConfig } from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { startCanvasResizePointerInteraction } from './CanvasResizePointerInteractionStart'

const rectItem: CanvasItem = {
  fill: '#ffffff',
  h: 80,
  id: 'rect-1',
  stroke: '#111827',
  type: 'rect',
  w: 120,
  x: 10,
  y: 20,
}

describe('CanvasResizePointerInteractionStart', () => {
  it('starts a resize interaction from selected bounds and handle state', () => {
    const result = startCanvasResizePointerInteraction(createInput())

    expect(result).toMatchObject({
      capturePointer: true,
      gesture: 'resize',
      interaction: {
        bounds: { h: 80, w: 120, x: 10, y: 20 },
        currentItems: [rectItem],
        handle: 'se',
        historyItems: [rectItem],
        ids: ['rect-1'],
        kind: 'resize',
        moved: false,
        pointerId: 1,
        startItems: [rectItem],
        startScreen: { x: 100, y: 140 },
        startWorld: { x: 90, y: 120 },
      },
      kind: 'resize',
    })
  })

  it('does not start without selected bounds', () => {
    const result = startCanvasResizePointerInteraction(createInput({
      selectedBounds: null,
    }))

    expect(result).toEqual({ capturePointer: false, kind: 'none' })
  })

  it('does not start when resize is disabled or pointer is not primary', () => {
    const disabledResult = startCanvasResizePointerInteraction(createInput({
      config: createCanvasAffordanceConfig({
        gestures: { resize: false },
      }),
    }))
    const secondaryButtonResult = startCanvasResizePointerInteraction(createInput({
      input: createPointerInput({ button: 2 }),
    }))

    expect(disabledResult).toEqual({ capturePointer: false, kind: 'none' })
    expect(secondaryButtonResult).toEqual({
      capturePointer: false,
      kind: 'none',
    })
  })
})

function createInput(
  overrides: Partial<Parameters<typeof startCanvasResizePointerInteraction>[0]> = {},
): Parameters<typeof startCanvasResizePointerInteraction>[0] {
  return {
    config: createCanvasAffordanceConfig(),
    handle: 'se',
    input: createPointerInput(),
    items: [rectItem],
    selectedBounds: { h: 80, w: 120, x: 10, y: 20 },
    selection: ['rect-1'],
    startScreen: { x: 100, y: 140 },
    startWorld: { x: 90, y: 120 },
    ...overrides,
  }
}

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 100,
    clientY: 140,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}
