import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  alignCanvasSelection,
  distributeCanvasSelection,
} from './CanvasItemAlignmentOperations'

function rect(id: string, x: number, y: number, w = 20, h = 20): CanvasItem {
  return {
    id,
    type: 'rect',
    x,
    y,
    w,
    h,
    fill: '#fff',
    stroke: '#000',
  }
}

function positions(items: CanvasItem[]) {
  return items.map((item) => ({ id: item.id, x: item.x, y: item.y }))
}

describe('CanvasItemAlignmentOperations', () => {
  test('aligns selected siblings to the left edge', () => {
    expect(
      positions(
        alignCanvasSelection(
          [rect('a', 10, 0), rect('b', 50, 10), rect('c', 80, 20)],
          ['a', 'b'],
          'alignLeft',
        ),
      ),
    ).toEqual([
      { id: 'a', x: 10, y: 0 },
      { id: 'b', x: 10, y: 10 },
      { id: 'c', x: 80, y: 20 },
    ])
  })

  test('aligns selected siblings on their center axis', () => {
    expect(
      positions(
        alignCanvasSelection(
          [rect('a', 0, 0, 20), rect('b', 60, 10, 40)],
          ['a', 'b'],
          'alignCenter',
        ),
      ),
    ).toEqual([
      { id: 'a', x: 40, y: 0 },
      { id: 'b', x: 30, y: 10 },
    ])
  })

  test('distributes selected siblings horizontally', () => {
    expect(
      positions(
        distributeCanvasSelection(
          [rect('a', 0, 0, 10), rect('b', 70, 10, 10), rect('c', 100, 20, 20)],
          ['a', 'b', 'c'],
          'distributeHorizontal',
        ),
      ),
    ).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 50, y: 10 },
      { id: 'c', x: 100, y: 20 },
    ])
  })

  test('distributes selected siblings vertically', () => {
    expect(
      positions(
        distributeCanvasSelection(
          [rect('a', 0, 0, 20, 10), rect('b', 10, 80), rect('c', 20, 100)],
          ['a', 'b', 'c'],
          'distributeVertical',
        ),
      ),
    ).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 45 },
      { id: 'c', x: 20, y: 100 },
    ])
  })

  test('does not align items across different parents', () => {
    const items: CanvasItem[] = [
      {
        ...rect('group', 0, 0),
        type: 'group',
        children: [rect('child', 100, 0)],
      },
      rect('sibling', 0, 0),
    ]

    expect(alignCanvasSelection(items, ['child', 'sibling'], 'alignLeft')).toBe(
      items,
    )
  })
})
