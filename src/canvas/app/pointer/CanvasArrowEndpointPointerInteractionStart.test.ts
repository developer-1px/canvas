import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import { createCanvasAffordanceConfig } from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  startCanvasArrowEndpointPointerInteraction,
} from './CanvasArrowEndpointPointerInteractionStart'

const arrowItem: CanvasItem = {
  end: { x: 220, y: 80 },
  h: 24,
  id: 'arrow-1',
  start: { x: 100, y: 80 },
  stroke: '#334155',
  strokeWidth: 3,
  type: 'arrow',
  w: 144,
  x: 88,
  y: 68,
}

describe('CanvasArrowEndpointPointerInteractionStart', () => {
  it('starts an arrow endpoint transform from a selected endpoint handle', () => {
    expect(startCanvasArrowEndpointPointerInteraction(createInput()))
      .toMatchObject({
        capturePointer: true,
        gesture: 'arrow-endpoint',
        interaction: {
          arrowId: 'arrow-1',
          currentItems: [arrowItem],
          endpoint: 'end',
          historyItems: [arrowItem],
          kind: 'arrow-endpoint',
          moved: false,
          pointerId: 1,
          startItems: [arrowItem],
          startScreen: { x: 220, y: 80 },
          startWorld: { x: 220, y: 80 },
        },
        kind: 'arrow-endpoint',
      })
  })

  it('does not start for locked arrows, disabled resize, or non-arrow items', () => {
    expect(startCanvasArrowEndpointPointerInteraction(createInput({
      items: [{ ...arrowItem, locked: true }],
    }))).toEqual({ capturePointer: false, kind: 'none' })
    expect(startCanvasArrowEndpointPointerInteraction(createInput({
      config: createCanvasAffordanceConfig({
        gestures: { resize: false },
      }),
    }))).toEqual({ capturePointer: false, kind: 'none' })
    expect(startCanvasArrowEndpointPointerInteraction(createInput({
      arrowId: 'rect-1',
      items: [{
        fill: '#fff',
        h: 40,
        id: 'rect-1',
        stroke: '#111',
        type: 'rect',
        w: 80,
        x: 0,
        y: 0,
      }],
    }))).toEqual({ capturePointer: false, kind: 'none' })
  })
})

function createInput(
  overrides: Partial<
    Parameters<typeof startCanvasArrowEndpointPointerInteraction>[0]
  > = {},
): Parameters<typeof startCanvasArrowEndpointPointerInteraction>[0] {
  return {
    arrowId: 'arrow-1',
    config: createCanvasAffordanceConfig(),
    endpoint: 'end',
    input: createPointerInput(),
    items: [arrowItem],
    startScreen: { x: 220, y: 80 },
    startWorld: { x: 220, y: 80 },
    ...overrides,
  }
}

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 220,
    clientY: 80,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}
