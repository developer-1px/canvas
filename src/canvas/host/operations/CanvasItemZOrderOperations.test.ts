import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import { reorderCanvasItems } from './CanvasItemZOrderOperations'

function rect(id: string): CanvasItem {
  return {
    id,
    type: 'rect',
    x: 0,
    y: 0,
    w: 40,
    h: 40,
    fill: '#fff',
    stroke: '#000',
  }
}

function ids(items: CanvasItem[]) {
  return items.map((item) => item.id)
}

describe('reorderCanvasItems', () => {
  test('moves selected items forward one slot', () => {
    expect(
      ids(reorderCanvasItems([rect('a'), rect('b'), rect('c'), rect('d')], ['b', 'd'], 'bringForward')),
    ).toEqual(['a', 'c', 'b', 'd'])
  })

  test('moves selected items backward one slot', () => {
    expect(
      ids(reorderCanvasItems([rect('a'), rect('b'), rect('c'), rect('d')], ['b', 'd'], 'sendBackward')),
    ).toEqual(['b', 'a', 'd', 'c'])
  })

  test('moves selected items to front while preserving their order', () => {
    expect(
      ids(reorderCanvasItems([rect('a'), rect('b'), rect('c'), rect('d')], ['b', 'c'], 'bringToFront')),
    ).toEqual(['a', 'd', 'b', 'c'])
  })

  test('moves selected items to back while preserving their order', () => {
    expect(
      ids(reorderCanvasItems([rect('a'), rect('b'), rect('c'), rect('d')], ['b', 'c'], 'sendToBack')),
    ).toEqual(['b', 'c', 'a', 'd'])
  })

  test('reorders selected children inside their group', () => {
    const [group] = reorderCanvasItems(
      [
        {
          ...rect('group'),
          type: 'group',
          children: [rect('a'), rect('b'), rect('c')],
        },
      ],
      ['b'],
      'bringForward',
    )

    expect(group.type).toBe('group')
    expect(group.type === 'group' ? ids(group.children) : []).toEqual([
      'a',
      'c',
      'b',
    ])
  })
})
