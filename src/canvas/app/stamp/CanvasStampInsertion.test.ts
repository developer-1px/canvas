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
        after: ['rect-1'],
      },
    )
  })

  it('selects standalone stamps when no target selection exists', () => {
    const commitItemsChange = vi.fn(() => true)

    insertCanvasStamp({
      context: {
        commitItemsChange,
        createId: vi.fn(() => 'stamp-1'),
        selection: [],
      },
      placement: {
        x: 58,
        y: 38,
      },
      stamp,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'add' }),
      { before: [], after: ['stamp-1'] },
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
      itemReadModel: createReadModel(
        { h: 80, w: 120, x: 10, y: 20 },
        2,
      ),
      selection: ['rect-1'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({
      attachedTo: 'rect-1',
      x: 8,
      y: -2,
    })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(),
      selection: ['rect-1', 'rect-2'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 142, y: 38 })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(
        { h: 80, w: 120, x: 10, y: 20 },
        0,
        2,
      ),
      selection: ['rect-1', 'rect-2'],
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 242, y: 38 })
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
    })).toEqual({ x: 150, y: 176 })

    expect(getCanvasStampControlsAnchor({
      itemReadModel: createReadModel({ h: 80, w: 120, x: 10, y: 120 }),
      selection: ['rect-1', 'rect-2'],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 150, y: 260 })

    expect(getCanvasStampControlsAnchor({
      itemReadModel: createReadModel(null),
      selection: [],
      viewport: { scale: 2, x: 10, y: 20 },
    })).toBeNull()
  })
})

function createReadModel(
  bounds: Bounds | null = { h: 80, w: 120, x: 10, y: 20 },
  attachedStampCount = 0,
  detachedStampCount = 0,
) {
  return {
    getAllItems: vi.fn(() =>
      [
        ...Array.from({ length: attachedStampCount }, (_, index) => ({
          attachedTo: 'rect-1',
          h: 44,
          id: `stamp-${index + 1}`,
          label: '+1',
          stamp: 'thumbs-up',
          type: 'stamp',
          w: 44,
          x: 0,
          y: 0,
        })),
        ...Array.from({ length: detachedStampCount }, (_, index) => ({
          h: 44,
          id: `detached-stamp-${index + 1}`,
          label: '+1',
          stamp: 'thumbs-up',
          type: 'stamp',
          w: 44,
          x: 142 + index * 50,
          y: 38,
        })),
      ],
    ),
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
