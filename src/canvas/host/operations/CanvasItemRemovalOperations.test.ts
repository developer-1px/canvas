import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import { removeCanvasItems } from './CanvasItemRemovalOperations'

describe('CanvasItemRemovalOperations', () => {
  test('removes selected groups with their children', () => {
    expect(removeCanvasItems([
      group('group-1', [rect('a', 10, 20), rect('b', 110, 20)]),
      rect('c', 220, 20),
    ], ['group-1'])).toEqual([
      rect('c', 220, 20),
    ])
  })

  test('removes selected children and syncs the remaining group bounds', () => {
    expect(removeCanvasItems([
      group('group-1', [rect('a', 10, 20), rect('b', 110, 40)]),
    ], ['a'])).toEqual([
      {
        children: [rect('b', 110, 40)],
        h: 40,
        id: 'group-1',
        type: 'group',
        w: 80,
        x: 110,
        y: 40,
      },
    ])
  })
})

function group(id: string, children: CanvasItem[]): CanvasItem {
  return {
    children,
    h: 60,
    id,
    type: 'group',
    w: 180,
    x: 10,
    y: 20,
  }
}

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
