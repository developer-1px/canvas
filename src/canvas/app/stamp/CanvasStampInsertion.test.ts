import { describe, expect, it, vi } from 'vitest'
import type { Bounds } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  getCanvasStampControlsAnchor,
  getCanvasStampInsertPlacement,
  insertCanvasStamp,
} from './CanvasStampInsertion'

const stamp = {
  label: '+1',
  stamp: 'thumbs-up',
  title: 'Thumbs up',
}

describe('CanvasStampInsertion', () => {
  it('commits a selected stamp item at the chosen placement', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasStamp({
      context: {
        commitItemsChange,
        createId: vi.fn(() => 'stamp-1'),
        selection: ['rect-1'],
      },
      placement: {
        attachedTo: 'rect-1',
        x: 278,
        y: 178,
      },
      stamp,
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [{
          h: 44,
          attachedTo: 'rect-1',
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

  it('attaches to single selection or falls back to viewport center', () => {
    const stageElement = createStageElement()

    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(),
      selection: ['rect-1'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({
      attachedTo: 'rect-1',
      x: 108,
      y: -2,
    })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(),
      selection: ['rect-1', 'rect-2'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 142, y: 38 })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(null),
      selection: [],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 58, y: 38 })
  })

  it('anchors stamp controls above the current selection', () => {
    expect(getCanvasStampControlsAnchor({
      itemReadModel: createReadModel(),
      selection: ['rect-1'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 150, y: 60 })

    expect(getCanvasStampControlsAnchor({
      itemReadModel: createReadModel(),
      selection: ['rect-1', 'rect-2'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 150, y: 60 })

    expect(getCanvasStampControlsAnchor({
      itemReadModel: createReadModel(null),
      selection: [],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toBeNull()
  })
})

function createReadModel(
  bounds: Bounds | null = { h: 80, w: 120, x: 10, y: 20 },
) {
  return {
    getSelectionBounds: vi.fn(() => bounds),
  } as unknown as Parameters<typeof getCanvasStampInsertPlacement>[0]['itemReadModel']
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
