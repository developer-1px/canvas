import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import {
  createCanvasItemReadModel,
  getCanvasItemIds,
  getCanvasValidSelection,
} from './CanvasItemReadModel'

describe('CanvasItemReadModel', () => {
  it('exposes item id and selection primitives without requiring a read model', () => {
    const items = createNestedItems()

    expect(getCanvasItemIds(items)).toEqual([
      'group-1',
      'rect-1',
      'rect-2',
    ])
    expect(getCanvasValidSelection(items, [
      'rect-1',
      'missing',
      'group-1',
      'rect-2',
      'rect-2',
    ])).toEqual(['group-1', 'rect-2'])
  })

  it('keeps read model selection methods on the same host primitives', () => {
    const items = createNestedItems()
    const readModel = createCanvasItemReadModel(items)

    expect(readModel.getAllIds()).toEqual(getCanvasItemIds(items))
    expect(readModel.getSelection(['rect-1', 'group-1'])).toEqual(
      getCanvasValidSelection(items, ['rect-1', 'group-1']),
    )
  })
})

function createNestedItems(): CanvasItem[] {
  return [
    {
      children: [
        {
          fill: '#ffffff',
          h: 40,
          id: 'rect-1',
          stroke: '#111111',
          type: 'rect',
          w: 80,
          x: 10,
          y: 20,
        },
      ],
      h: 60,
      id: 'group-1',
      type: 'group',
      w: 100,
      x: 0,
      y: 0,
    },
    {
      fill: '#ffffff',
      h: 40,
      id: 'rect-2',
      stroke: '#111111',
      type: 'rect',
      w: 80,
      x: 120,
      y: 20,
    },
  ]
}
