import { describe, expect, it } from 'vitest'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import type { CanvasItem } from '../model'
import { createCanvasDocumentController } from './CanvasDocumentController'

const markerItem: CanvasItem = {
  h: 24,
  id: 'marker-1',
  opacity: 1,
  points: [
    { x: 10, y: 20 },
    { x: 30, y: 40 },
  ],
  stroke: '#475569',
  strokeWidth: 4,
  type: 'marker',
  w: 24,
  x: 8,
  y: 18,
}

describe('CanvasDocumentController mutation containment', () => {
  it('normalizes built-in drawing bounds before committing item changes', () => {
    const controller = createCanvasDocumentController([])

    expect(
      controller.commitItemsChange(
        {
          items: [{
            ...markerItem,
            h: 1,
            w: 1,
            x: 0,
            y: 0,
          }],
          type: 'add',
        },
        [],
        {
          after: [markerItem.id],
          before: [],
        },
      ),
    ).toBe(true)
    expect(controller.readItems()).toEqual([markerItem])
  })

  it('returns false and preserves document items for invalid item commits', () => {
    const controller = createCanvasDocumentController(INITIAL_ITEMS)

    expect(
      controller.commitItemsChange(
        {
          items: [{ ...markerItem, opacity: 0 }],
          type: 'add',
        },
        INITIAL_ITEMS,
        {
          after: [markerItem.id],
          before: [],
        },
      ),
    ).toBe(false)
    expect(controller.readItems()).toEqual(INITIAL_ITEMS)
    expect(controller.readSelection()).toEqual([])
  })

  it('returns current items for invalid live item replacement', () => {
    const controller = createCanvasDocumentController(INITIAL_ITEMS)

    expect(
      controller.replaceItems(
        INITIAL_ITEMS,
        [{ ...markerItem, points: [{ x: 10, y: 20 }] }],
      ),
    ).toBe(INITIAL_ITEMS)
    expect(controller.readItems()).toEqual(INITIAL_ITEMS)
  })
})
