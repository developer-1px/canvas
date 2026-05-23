import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import { cloneCanvasItemsWithNewIds } from './CanvasItemCloneOperations'

const arrow: CanvasItem = {
  id: 'arrow-1',
  type: 'arrow',
  x: 88,
  y: 88,
  w: 144,
  h: 44,
  start: { x: 100, y: 100 },
  end: { x: 200, y: 120 },
  stroke: '#334155',
  strokeWidth: 3,
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
})
