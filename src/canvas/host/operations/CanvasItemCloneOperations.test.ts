import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import { cloneCanvasItemsWithNewIds } from './CanvasItemCloneOperations'

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
})
