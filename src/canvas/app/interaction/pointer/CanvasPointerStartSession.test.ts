import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppStageElement } from '../../stage/CanvasAppStageElement'
import { getCanvasPointerStartProjection } from './CanvasPointerStartSession'

describe('CanvasPointerStartSession', () => {
  it('projects pointer down input into screen and world start coordinates', () => {
    const stageElement = createStageElement()

    expect(
      getCanvasPointerStartProjection({
        event: { clientX: 140, clientY: 90 },
        stageElement,
        viewport: { scale: 2, x: 20, y: 30 },
      }),
    ).toEqual({
      startScreen: { x: 140, y: 90 },
      startWorld: { x: 60, y: 30 },
    })
    expect(stageElement.getScreenPoint).toHaveBeenCalledWith({
      clientX: 140,
      clientY: 90,
    })
  })
})

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
