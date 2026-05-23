import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import { createReorderCanvasSiblingArraysPatch } from './CanvasDocumentReorderPatch'

describe('CanvasDocumentReorderPatch', () => {
  it('creates root sibling move patches from before and after item order', () => {
    expect(
      createReorderCanvasSiblingArraysPatch({
        beforeItems: [rect('a'), rect('b'), rect('c'), rect('d')],
        afterItems: [rect('a'), rect('c'), rect('b'), rect('d')],
      }),
    ).toEqual([{
      op: 'move',
      from: '/2',
      path: '/1',
    }])
  })

  it('creates nested sibling move patches with child pointers', () => {
    expect(
      createReorderCanvasSiblingArraysPatch({
        beforeItems: [group('group-1', [rect('a'), rect('b'), rect('c')])],
        afterItems: [group('group-1', [rect('a'), rect('c'), rect('b')])],
      }),
    ).toEqual([{
      op: 'move',
      from: '/0/children/2',
      path: '/0/children/1',
    }])
  })

  it('returns an empty patch when sibling order is unchanged', () => {
    const items = [rect('a'), rect('b')]

    expect(
      createReorderCanvasSiblingArraysPatch({
        beforeItems: items,
        afterItems: items,
      }),
    ).toEqual([])
  })
})

function rect(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}

function group(id: string, children: CanvasItem[]): CanvasItem {
  return {
    children,
    h: 40,
    id,
    type: 'group',
    w: 40,
    x: 0,
    y: 0,
  }
}
