import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  resizeCanvasItems,
  translateCanvasItems,
} from './CanvasItemTransformOperations'

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

describe('CanvasItemTransformOperations drawing items', () => {
  test('translates arrow bounds and endpoints together', () => {
    expect(translateCanvasItems([arrow], ['arrow-1'], 10, -5)[0]).toEqual({
      ...arrow,
      x: 98,
      y: 83,
      start: { x: 110, y: 95 },
      end: { x: 210, y: 115 },
    })
  })

  test('resizes arrow bounds and endpoints together', () => {
    expect(
      resizeCanvasItems(
        [arrow],
        ['arrow-1'],
        { x: 88, y: 88, w: 144, h: 44 },
        { x: 88, y: 88, w: 288, h: 88 },
      )[0],
    ).toEqual({
      ...arrow,
      w: 288,
      h: 88,
      start: { x: 112, y: 112 },
      end: { x: 312, y: 152 },
    })
  })
})
