import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  getCanvasPointerDragProjection,
  getCanvasPointerDragSession,
} from './CanvasPointerDragSession'
import type { Interaction } from './CanvasInteractionState'

describe('CanvasPointerDragSession', () => {
  it('returns the active interaction for the matching pointer', () => {
    const interaction = moveInteraction({ pointerId: 7 })

    expect(
      getCanvasPointerDragSession({
        event: { pointerId: 7 },
        interaction,
      }),
    ).toEqual({ interaction })
  })

  it('ignores empty or mismatched pointer interactions', () => {
    expect(
      getCanvasPointerDragSession({
        event: { pointerId: 7 },
        interaction: { kind: 'none' },
      }),
    ).toBeNull()
    expect(
      getCanvasPointerDragSession({
        event: { pointerId: 8 },
        interaction: moveInteraction({ pointerId: 7 }),
      }),
    ).toBeNull()
  })

  it('projects the active pointer into screen and world coordinates', () => {
    const interaction = moveInteraction({ pointerId: 7 })
    const stageElement = createStageElement()

    expect(
      getCanvasPointerDragProjection({
        event: {
          clientX: 120,
          clientY: 80,
          pointerId: 7,
        },
        interaction,
        stageElement,
        viewport: { scale: 2, x: 10, y: 20 },
      }),
    ).toEqual({
      currentScreen: { x: 120, y: 80 },
      currentWorld: { x: 55, y: 30 },
      interaction,
    })
    expect(stageElement.getScreenPoint).toHaveBeenCalledWith({
      clientX: 120,
      clientY: 80,
      pointerId: 7,
    })
  })
})

function moveInteraction(
  overrides: Partial<Extract<Interaction, { kind: 'move' }>> = {},
): Extract<Interaction, { kind: 'move' }> {
  const item = rect('rect-1')

  return {
    bounds: { h: 40, w: 40, x: 0, y: 0 },
    currentItems: [item],
    historyItems: [item],
    historySelection: ['rect-1'],
    ids: ['rect-1'],
    kind: 'move',
    moved: true,
    pointerId: 1,
    startItems: [item],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
}

function createStageElement(): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => null),
    getScreenPoint: vi.fn((event: { clientX: number; clientY: number }) => ({
      x: event.clientX,
      y: event.clientY,
    })),
    getViewportCenter: vi.fn(() => null),
    releasePointer: vi.fn(),
  }
}

function rect(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}
