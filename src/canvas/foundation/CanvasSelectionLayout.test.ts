import { describe, expect, it } from 'vitest'

import type { Bounds } from '../core'
import {
  canFlipCanvasSelectionItems,
  canTidyCanvasSelectionItems,
  flipCanvasSelectionItems,
  tidyCanvasSelectionItems,
} from './CanvasSelectionLayout'

type TestItem = {
  hidden?: boolean
  id: string
  kind: 'line' | 'shape'
  mirrored?: boolean
  rect: Bounds
}

const items: TestItem[] = [
  { id: 'a', kind: 'shape', rect: { h: 20, w: 40, x: 0, y: 0 } },
  { id: 'b', kind: 'shape', rect: { h: 30, w: 20, x: 100, y: 10 } },
  { id: 'c', kind: 'shape', rect: { h: 10, w: 10, x: 20, y: 80 } },
  { hidden: true, id: 'hidden', kind: 'shape', rect: { h: 10, w: 10, x: 200, y: 0 } },
  { id: 'line', kind: 'line', rect: { h: 1, w: 60, x: 10, y: 120 } },
]

describe('CanvasSelectionLayout', () => {
  it('flips selected item bounds around the selection pivot', () => {
    expect(canFlipCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b'],
    })).toBe(true)

    const flipped = flipCanvasSelectionItems({
      axis: 'horizontal',
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b'],
      updateItemBounds,
    })

    expect(flipped.find((item) => item.id === 'a')?.rect).toMatchObject({ x: 80 })
    expect(flipped.find((item) => item.id === 'b')?.rect).toMatchObject({ x: 0 })
    expect(flipped.find((item) => item.id === 'c')?.rect).toEqual(items[2].rect)
  })

  it('allows apps to customize flip updates while reusing selection pivot calculation', () => {
    const flipped = flipCanvasSelectionItems({
      axis: 'vertical',
      flipItem: ({ item, reflectedBounds }) => ({
        ...item,
        mirrored: true,
        rect: reflectedBounds,
      }),
      getItemBounds,
      getItemId,
      items,
      selection: ['a'],
      updateItemBounds,
    })

    expect(flipped.find((item) => item.id === 'a')).toMatchObject({
      mirrored: true,
      rect: { y: 0 },
    })
  })

  it('blocks flip when any selected item is not selectable', () => {
    expect(canFlipCanvasSelectionItems({
      getItemBounds,
      getItemId,
      isItemSelectable,
      items,
      selection: ['a', 'hidden'],
    })).toBe(false)
    expect(flipCanvasSelectionItems({
      axis: 'horizontal',
      getItemBounds,
      getItemId,
      isItemSelectable,
      items,
      selection: ['a', 'hidden'],
      updateItemBounds,
    })).toBe(items)
  })

  it('tidies selected items into a row-major grid using the selection origin', () => {
    expect(canTidyCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b', 'c'],
    })).toBe(true)

    const tidied = tidyCanvasSelectionItems({
      gap: 5,
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b', 'c'],
      updateItemBounds,
    })

    expect(tidied.find((item) => item.id === 'a')?.rect).toMatchObject({ x: 0, y: 0 })
    expect(tidied.find((item) => item.id === 'b')?.rect).toMatchObject({ x: 45, y: 0 })
    expect(tidied.find((item) => item.id === 'c')?.rect).toMatchObject({ x: 0, y: 35 })
  })

  it('blocks tidy when selection is too small or contains unsupported items', () => {
    expect(canTidyCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b'],
    })).toBe(false)
    expect(canTidyCanvasSelectionItems({
      getItemBounds,
      getItemId,
      isItemSelectable: (item) => isItemSelectable(item) && item.kind !== 'line',
      items,
      selection: ['a', 'b', 'line'],
    })).toBe(false)
    expect(tidyCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b'],
      updateItemBounds,
    })).toBe(items)
  })
})

function getItemId(item: TestItem) {
  return item.id
}

function getItemBounds(item: TestItem) {
  return item.rect
}

function isItemSelectable(item: TestItem) {
  return item.hidden !== true
}

function updateItemBounds(item: TestItem, rect: Bounds): TestItem {
  return {
    ...item,
    rect,
  }
}
