import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  cloneCanvasItemsWithNewIds,
  duplicateCanvasSelection,
} from './CanvasItemCloneOperations'

const arrow: CanvasItem = {
  id: 'arrow-1',
  type: 'arrow',
  x: 88,
  y: 88,
  w: 124,
  h: 44,
  start: { x: 100, y: 100 },
  end: { x: 200, y: 120 },
  stroke: '#334155',
  strokeWidth: 3,
}

const marker: CanvasItem = {
  id: 'marker-1',
  type: 'marker',
  x: 98,
  y: 98,
  w: 104,
  h: 24,
  points: [{ x: 100, y: 100 }, { x: 200, y: 120 }],
  stroke: '#475569',
  strokeWidth: 4,
  opacity: 1,
}

describe('CanvasItemCloneOperations drawing items', () => {
  test('offsets arrow bounds and endpoints together', () => {
    expect(
      cloneCanvasItemsWithNewIds(
        [arrow],
        (prefix) => `${prefix}-copy`,
        { x: 12, y: 16 },
      ),
    ).toEqual([{
      ...arrow,
      id: 'arrow-copy',
      x: 100,
      y: 104,
      start: { x: 112, y: 116 },
      end: { x: 212, y: 136 },
    }])
  })

  test('offsets marker bounds and points together', () => {
    expect(
      cloneCanvasItemsWithNewIds(
        [marker],
        (prefix) => `${prefix}-copy`,
        { x: 12, y: 16 },
      ),
    ).toEqual([{
      ...marker,
      id: 'marker-copy',
      x: 110,
      y: 114,
      points: [{ x: 112, y: 116 }, { x: 212, y: 136 }],
    }])
  })

  test('duplicates groups with new child ids and synced bounds', () => {
    const createId = createSequenceId()

    expect(
      cloneCanvasItemsWithNewIds(
        [
          {
            children: [
              rect('rect-1', 10, 20),
              rect('rect-2', 140, 60),
            ],
            h: 80,
            id: 'group-1',
            type: 'group',
            w: 210,
            x: 10,
            y: 20,
          },
        ],
        createId,
        { x: 12, y: 16 },
      ),
    ).toEqual([
      {
        children: [
          rect('rect-copy-2', 22, 36),
          rect('rect-copy-3', 152, 76),
        ],
        h: 80,
        id: 'group-copy-1',
        type: 'group',
        w: 210,
        x: 22,
        y: 36,
      },
    ])
  })

  test('duplicates a selected child inside its group', () => {
    const items: CanvasItem[] = [
      {
        children: [
          rect('rect-1', 10, 20),
          rect('rect-2', 140, 60),
        ],
        h: 80,
        id: 'group-1',
        type: 'group',
        w: 210,
        x: 10,
        y: 20,
      },
      rect('outside', 320, 40),
    ]

    expect(
      duplicateCanvasSelection(
        items,
        ['rect-1'],
        createSequenceId(),
        { x: 12, y: 16 },
      ),
    ).toEqual({
      clones: [rect('rect-copy-1', 22, 36)],
      items: [
        {
          children: [
            rect('rect-1', 10, 20),
            rect('rect-copy-1', 22, 36),
            rect('rect-2', 140, 60),
          ],
          h: 80,
          id: 'group-1',
          type: 'group',
          w: 210,
          x: 10,
          y: 20,
        },
        rect('outside', 320, 40),
      ],
      selection: ['rect-copy-1'],
    })
  })
})

function rect(id: string, x: number, y: number): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x,
    y,
  }
}

function createSequenceId() {
  let count = 0

  return (prefix: string) => {
    count += 1
    return `${prefix}-copy-${count}`
  }
}
