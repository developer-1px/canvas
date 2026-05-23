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

  test('translates marker bounds and points together', () => {
    expect(translateCanvasItems([marker], ['marker-1'], 10, -5)[0]).toEqual({
      ...marker,
      x: 108,
      y: 93,
      points: [{ x: 110, y: 95 }, { x: 210, y: 115 }],
    })
  })

  test('resizes marker bounds and points together', () => {
    expect(
      resizeCanvasItems(
        [marker],
        ['marker-1'],
        { x: 98, y: 98, w: 104, h: 24 },
        { x: 98, y: 98, w: 208, h: 48 },
      )[0],
    ).toEqual({
      ...marker,
      w: 208,
      h: 48,
      points: [{ x: 102, y: 102 }, { x: 302, y: 142 }],
    })
  })
})
