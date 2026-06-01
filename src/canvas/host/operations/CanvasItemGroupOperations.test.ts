import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  groupCanvasSelection,
  ungroupCanvasSelection,
} from './CanvasItemGroupOperations'

describe('CanvasItemGroupOperations', () => {
  test('groups sibling selections into an invisible wrapper with synced bounds', () => {
    const a = rect('a', 10, 20, 80, 40)
    const b = rect('b', 150, 60, 60, 30)
    const c = rect('c', 260, 40, 50, 50)

    expect(groupCanvasSelection([a, b, c], ['a', 'b'], 'group-1')).toEqual({
      items: [
        {
          children: [a, b],
          h: 70,
          id: 'group-1',
          type: 'group',
          w: 200,
          x: 10,
          y: 20,
        },
        c,
      ],
      selection: ['group-1'],
    })
  })

  test('ungroups selected wrappers and restores child selection', () => {
    const a = rect('a', 10, 20, 80, 40)
    const b = rect('b', 150, 60, 60, 30)
    const c = rect('c', 260, 40, 50, 50)

    expect(ungroupCanvasSelection([
      {
        children: [a, b],
        h: 70,
        id: 'group-1',
        type: 'group',
        w: 200,
        x: 10,
        y: 20,
      },
      c,
    ], ['group-1'])).toEqual({
      items: [a, b, c],
      selection: ['a', 'b'],
    })
  })
})

function rect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): CanvasItem {
  return {
    fill: '#ffffff',
    h,
    id,
    stroke: '#111827',
    type: 'rect',
    w,
    x,
    y,
  }
}
