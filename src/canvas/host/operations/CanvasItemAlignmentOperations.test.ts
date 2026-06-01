import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  alignCanvasSelection,
  canTidyCanvasSelection,
  distributeCanvasSelection,
  tidyCanvasSelection,
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

  test.each([
    ['alignRight', [{ id: 'a', x: 70, y: 20 }, { id: 'b', x: 50, y: 40 }]],
    ['alignTop', [{ id: 'a', x: 10, y: 20 }, { id: 'b', x: 50, y: 20 }]],
    ['alignMiddle', [{ id: 'a', x: 10, y: 50 }, { id: 'b', x: 50, y: 30 }]],
    ['alignBottom', [{ id: 'a', x: 10, y: 80 }, { id: 'b', x: 50, y: 40 }]],
  ] as const)('supports %s', (mode, expected) => {
    expect(
      positions(
        alignCanvasSelection(
          [rect('a', 10, 20, 20, 20), rect('b', 50, 40, 40, 60)],
          ['a', 'b'],
          mode,
        ),
      ),
    ).toEqual(expected)
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

  test('tidies selected non-drawing siblings into a compact grid', () => {
    const arrow: CanvasItem = {
      end: { x: 280, y: 120 },
      h: 40,
      id: 'arrow-1',
      start: { x: 220, y: 80 },
      stroke: '#000',
      strokeWidth: 2,
      type: 'arrow',
      w: 60,
      x: 220,
      y: 80,
    }
    const result = tidyCanvasSelection(
      [
        rect('a', 120, 40, 20, 20),
        arrow,
        rect('b', 10, 20, 40, 20),
        rect('c', 90, 120, 20, 30),
      ],
      ['a', 'arrow-1', 'b', 'c'],
      { gap: 10 },
    )

    expect(positions(result)).toEqual([
      { id: 'a', x: 60, y: 20 },
      { id: 'arrow-1', x: 220, y: 80 },
      { id: 'b', x: 10, y: 20 },
      { id: 'c', x: 10, y: 60 },
    ])
    expect(result[1]).toBe(arrow)
  })

  test('requires three tidy-eligible items', () => {
    const items = [
      rect('a', 120, 40),
      rect('b', 10, 20),
      {
        end: { x: 280, y: 120 },
        h: 40,
        id: 'arrow-1',
        start: { x: 220, y: 80 },
        stroke: '#000',
        strokeWidth: 2,
        type: 'arrow',
        w: 60,
        x: 220,
        y: 80,
      },
    ] satisfies CanvasItem[]

    expect(canTidyCanvasSelection(items, ['a', 'b', 'arrow-1'])).toBe(false)
    expect(tidyCanvasSelection(items, ['a', 'b', 'arrow-1'])).toBe(items)
  })
})
