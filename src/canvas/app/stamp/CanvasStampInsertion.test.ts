import { describe, expect, it, vi } from 'vitest'
import type { Bounds } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  getCanvasStampInsertCenter,
  insertCanvasStamp,
} from './CanvasStampInsertion'

const stamp = {
  label: '+1',
  stamp: 'thumbs-up',
  title: 'Thumbs up',
}

describe('CanvasStampInsertion', () => {
  it('commits a selected stamp item at the chosen center', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasStamp({
      center: { x: 300, y: 200 },
      context: {
        commitItemsChange,
        createId: vi.fn(() => 'stamp-1'),
        selection: ['rect-1'],
      },
      stamp,
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [{
          h: 44,
          id: 'stamp-1',
          label: '+1',
          stamp: 'thumbs-up',
          type: 'stamp',
          w: 44,
          x: 278,
          y: 178,
        }],
      },
      {
        before: ['rect-1'],
        after: ['stamp-1'],
      },
    )
  })

  it('anchors beside selection bounds or falls back to viewport center', () => {
    const stageElement = createStageElement()

    expect(getCanvasStampInsertCenter({
      itemReadModel: createReadModel(),
      selection: ['rect-1'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 164, y: 60 })
    expect(getCanvasStampInsertCenter({
      itemReadModel: createReadModel(null),
      selection: [],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 80, y: 60 })
  })
})

function createReadModel(
  bounds: Bounds | null = { h: 80, w: 120, x: 10, y: 20 },
) {
  return {
    getSelectionBounds: vi.fn(() => bounds),
  } as unknown as Parameters<typeof getCanvasStampInsertCenter>[0]['itemReadModel']
}

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
