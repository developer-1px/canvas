import { describe, expect, it, vi } from 'vitest'
import type { Bounds } from '../../../../entities'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import {
  getCanvasStampInsertPlacement,
  insertCanvasStamp,
} from './CanvasStampInsertion'

const stamp = {
  label: '+1',
  stamp: 'thumbs-up',
  title: 'Thumbs up',
}

describe('CanvasStampInsertion', () => {
  it('commits an independent selected stamp item at the chosen placement', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasStamp({
      context: {
        commitItemsChange,
        createId: vi.fn(() => 'stamp-1'),
        selection: ['rect-1'],
      },
      placement: {
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

  it('places standalone stamps from viewport center and stacks same-row stamps', () => {
    const stageElement = createStageElement()

    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(),
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 58, y: 38 })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(
        { h: 80, w: 120, x: 10, y: 20 },
      ),
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 58, y: 38 })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(
        { h: 80, w: 120, x: 10, y: 20 },
        2,
      ),
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 158, y: 38 })
    expect(getCanvasStampInsertPlacement({
      itemReadModel: createReadModel(null),
      stageElement,
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({ x: 58, y: 38 })
  })
})

function createReadModel(
  bounds: Bounds | null = { h: 80, w: 120, x: 10, y: 20 },
  detachedStampCount = 0,
) {
  return {
    getAllItems: vi.fn(() =>
      [
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
