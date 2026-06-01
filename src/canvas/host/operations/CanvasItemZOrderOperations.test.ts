import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  canReorderCanvasItems,
  reorderCanvasItems,
} from './CanvasItemZOrderOperations'

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

function sectionItem(id: string): CanvasItem {
  return {
    accent: '#64748b',
    body: '',
    component: 'section',
    fill: '#ffffff',
    h: 120,
    id,
    stroke: '#94a3b8',
    title: 'Section',
    type: 'component',
    w: 200,
    x: 0,
    y: 0,
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

  test('reports whether a reorder mode can change the selected sibling order', () => {
    const items = [rect('a'), rect('b'), rect('c')]

    expect(canReorderCanvasItems(items, ['a'], 'sendBackward')).toBe(false)
    expect(canReorderCanvasItems(items, ['a'], 'sendToBack')).toBe(false)
    expect(canReorderCanvasItems(items, ['a'], 'bringForward')).toBe(true)
    expect(canReorderCanvasItems(items, ['a'], 'bringToFront')).toBe(true)
    expect(canReorderCanvasItems(items, ['c'], 'bringForward')).toBe(false)
    expect(canReorderCanvasItems(items, ['c'], 'bringToFront')).toBe(false)
  })

  test('keeps section layers anchored behind non-section sibling reorder', () => {
    const items = [sectionItem('section'), rect('a'), rect('b')]

    expect(ids(reorderCanvasItems(items, ['a'], 'sendToBack'))).toEqual([
      'section',
      'a',
      'b',
    ])
    expect(canReorderCanvasItems(items, ['a'], 'sendToBack')).toBe(false)
    expect(ids(reorderCanvasItems(items, ['a'], 'bringToFront'))).toEqual([
      'section',
      'b',
      'a',
    ])
  })

  test('allows selected section layers to be reordered', () => {
    expect(
      ids(
        reorderCanvasItems(
          [sectionItem('section'), rect('a'), rect('b')],
          ['section'],
          'bringToFront',
        ),
      ),
    ).toEqual(['a', 'b', 'section'])
  })
})
