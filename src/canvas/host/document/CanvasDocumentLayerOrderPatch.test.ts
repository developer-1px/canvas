import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import { createCanvasDocumentLayerOrderPatch } from './CanvasDocumentLayerOrderPatch'

describe('CanvasDocumentLayerOrderPatch', () => {
  it('creates root sibling layer-order replace patches', () => {
    const items = [rect('a'), rect('b'), rect('c'), rect('d')]

    expect(
      createCanvasDocumentLayerOrderPatch({
        items,
        mode: 'bringForward',
        selection: ['b', 'd'],
      }),
    ).toEqual([{
      op: 'replace',
      path: '',
      value: [items[0], items[2], items[1], items[3]],
    }])
  })

  it('creates nested sibling layer-order replace patches with child pointers', () => {
    const children = [rect('a'), rect('b'), rect('c')]
    const items = [group('group-1', children)]

    expect(
      createCanvasDocumentLayerOrderPatch({
        items,
        mode: 'bringForward',
        selection: ['b'],
      }),
    ).toEqual([{
      op: 'replace',
      path: '/0/children',
      value: [children[0], children[2], children[1]],
    }])
  })

  it('keeps nested layer changes when a root layer is reordered too', () => {
    const children = [rect('a'), rect('b'), rect('c')]
    const rootItem = rect('root-a')
    const groupItem = group('group-1', children)
    const lastItem = rect('root-c')
    const reorderedGroup = group('group-1', [
      children[0],
      children[2],
      children[1],
    ])

    expect(
      createCanvasDocumentLayerOrderPatch({
        items: [rootItem, groupItem, lastItem],
        mode: 'bringForward',
        selection: ['root-a', 'b'],
      }),
    ).toEqual([{
      op: 'replace',
      path: '',
      value: [reorderedGroup, rootItem, lastItem],
    }])
  })

  it('returns an empty patch when sibling order is unchanged', () => {
    expect(
      createCanvasDocumentLayerOrderPatch({
        items: [rect('a'), rect('b')],
        mode: 'sendToBack',
        selection: ['a'],
      }),
    ).toEqual([])
  })

  it('keeps section layers anchored for non-section reorder patches', () => {
    const section = sectionItem('section')
    const items = [section, rect('a'), rect('b')]

    expect(
      createCanvasDocumentLayerOrderPatch({
        items,
        mode: 'sendToBack',
        selection: ['a'],
      }),
    ).toEqual([])
    expect(
      createCanvasDocumentLayerOrderPatch({
        items,
        mode: 'bringToFront',
        selection: ['a'],
      }),
    ).toEqual([{
      op: 'replace',
      path: '',
      value: [section, items[2], items[1]],
    }])
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
