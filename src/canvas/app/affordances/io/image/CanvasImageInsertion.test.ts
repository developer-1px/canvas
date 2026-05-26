import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import {
  getCanvasImageInsertCenter,
  insertCanvasImageSource,
} from './CanvasImageInsertion'

const source = {
  dataUrl: 'data:image/png;base64,aW1hZ2U=',
  mimeType: 'image/png',
  naturalHeight: 100,
  naturalWidth: 200,
}

describe('CanvasImageInsertion', () => {
  it('commits imported image source as a selected canvas image item', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasImageSource({
      center: { x: 300, y: 200 },
      context: {
        commitItemsChange,
        createId: vi.fn(() => 'image-1'),
        selection: ['rect-1'],
      },
      source,
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [expect.objectContaining({
          id: 'image-1',
          type: 'image',
          x: 200,
          y: 150,
        })],
      },
      {
        before: ['rect-1'],
        after: ['image-1'],
      },
    )
  })

  it('derives insert center from dropped screen coordinates or viewport center', () => {
    const stageElement = createStageElement()

    expect(getCanvasImageInsertCenter({
      event: { clientX: 90, clientY: 130 },
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 20, y: 30 })
    expect(getCanvasImageInsertCenter({
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 80, y: 60 })
  })
})

function createStageElement(): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(() => () => undefined),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => null),
    getScreenPoint: vi.fn(() => ({ x: 50, y: 80 })),
    getViewportCenter: vi.fn(() => ({ x: 80, y: 60 })),
    releasePointer: vi.fn(),
  }
}
