import { describe, expect, it } from 'vitest'

import {
  moveCanvasSelection,
  resizeCanvasSelection,
  type CanvasTransformAdapter,
} from './CanvasTransformEngine'

type TransformTestItem = {
  h: number
  id: string
  w: number
  x: number
  y: number
}

const adapter: CanvasTransformAdapter<TransformTestItem> = {
  resizeSelection: ({ items, selection, to }) =>
    items.map((item) =>
      selection.includes(item.id)
        ? { ...item, ...to }
        : item,
    ),
  translateSelection: ({ dx, dy, items, selection }) =>
    items.map((item) =>
      selection.includes(item.id)
        ? { ...item, x: item.x + dx, y: item.y + dy }
        : item,
    ),
}

describe('CanvasTransformEngine', () => {
  it('moves selected items through a transform adapter', () => {
    expect(moveCanvasSelection({
      adapter,
      dx: 5,
      dy: -3,
      items: [
        { h: 10, id: 'selected', w: 20, x: 1, y: 2 },
        { h: 10, id: 'other', w: 20, x: 30, y: 40 },
      ],
      selection: ['selected'],
    })).toEqual([
      { h: 10, id: 'selected', w: 20, x: 6, y: -1 },
      { h: 10, id: 'other', w: 20, x: 30, y: 40 },
    ])
  })

  it('resizes selected items through a resize bounds plan', () => {
    expect(resizeCanvasSelection({
      adapter,
      bounds: { h: 20, w: 40, x: 10, y: 10 },
      handle: 'se',
      items: [{ h: 20, id: 'selected', w: 40, x: 10, y: 10 }],
      point: { x: 70, y: 50 },
      selection: ['selected'],
    })).toEqual([
      { h: 40, id: 'selected', w: 60, x: 10, y: 10 },
    ])
  })
})
