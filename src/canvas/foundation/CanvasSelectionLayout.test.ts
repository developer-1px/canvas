import { describe, expect, it } from 'vitest'

import type { Bounds } from '../core'
import {
  alignCanvasRectList,
  alignCanvasSelectionItems,
  canAlignCanvasSelectionItems,
  canDistributeCanvasSelectionItems,
  canFlipCanvasSelectionItems,
  canReorderCanvasSelectionItems,
  canTidyCanvasSelectionItems,
  distributeCanvasRectList,
  distributeCanvasSelectionItems,
  flipCanvasSelectionItems,
  getCanvasAlignedBounds,
  getCanvasAlignmentDelta,
  insertCanvasItemAtTargetPlacement,
  moveCanvasItemToTargetPlacement,
  moveCanvasSelectionItemsToIndex,
  reorderCanvasSelectionItems,
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
  it('reorders selected items across z-order modes', () => {
    const orderItems = items.slice(0, 4)

    expect(canReorderCanvasSelectionItems({
      getItemId,
      items: orderItems,
      mode: 'bringForward',
      selection: ['b'],
    })).toBe(true)
    expect(getIds(reorderCanvasSelectionItems({
      getItemId,
      items: [...orderItems],
      mode: 'bringForward',
      selection: ['b', 'hidden'],
    }))).toEqual(['a', 'c', 'b', 'hidden'])
    expect(getIds(reorderCanvasSelectionItems({
      getItemId,
      items: [...orderItems],
      mode: 'sendBackward',
      selection: ['c'],
    }))).toEqual(['a', 'c', 'b', 'hidden'])
    expect(getIds(reorderCanvasSelectionItems({
      getItemId,
      items: [...orderItems],
      mode: 'bringToFront',
      selection: ['b', 'c'],
    }))).toEqual(['a', 'hidden', 'b', 'c'])
    expect(getIds(reorderCanvasSelectionItems({
      getItemId,
      items: [...orderItems],
      mode: 'sendToBack',
      selection: ['b', 'c'],
    }))).toEqual(['b', 'c', 'a', 'hidden'])
  })

  it('excludes unsupported items from reorder', () => {
    const orderItems = items.slice(0, 4)

    expect(canReorderCanvasSelectionItems({
      getItemId,
      isItemSelectable,
      items: orderItems,
      mode: 'bringForward',
      selection: ['hidden'],
    })).toBe(false)
    expect(getIds(reorderCanvasSelectionItems({
      getItemId,
      isItemSelectable,
      items: [...orderItems],
      mode: 'bringToFront',
      selection: ['b', 'hidden'],
    }))).toEqual(['a', 'c', 'hidden', 'b'])
  })

  it('moves selected item blocks to an absolute drop index', () => {
    const orderItems = items.slice(0, 4)

    expect(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['b', 'c'],
      toIndex: orderItems.length,
    })).toMatchObject({
      changed: true,
      items: [
        { id: 'a' },
        { id: 'hidden' },
        { id: 'b' },
        { id: 'c' },
      ],
    })

    expect(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['b', 'c'],
      toIndex: 0,
    })).toMatchObject({
      changed: true,
      items: [
        { id: 'b' },
        { id: 'c' },
        { id: 'a' },
        { id: 'hidden' },
      ],
    })
  })

  it('excludes unsupported items from drop-index moves', () => {
    const orderItems = items.slice(0, 4)

    expect(moveCanvasSelectionItemsToIndex({
      getItemId,
      isItemSelectable,
      items: orderItems,
      selection: ['b', 'hidden'],
      toIndex: orderItems.length,
    })).toMatchObject({
      changed: true,
      items: [
        { id: 'a' },
        { id: 'c' },
        { id: 'hidden' },
        { id: 'b' },
      ],
    })
  })

  it('reports no-op drop-index moves', () => {
    const orderItems = items.slice(0, 4)

    expect(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['b', 'c'],
      toIndex: 3,
    })).toMatchObject({
      changed: false,
      items: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'hidden' },
      ],
    })

    expect(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['missing'],
      toIndex: 0,
    })).toMatchObject({
      changed: false,
      items: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'hidden' },
      ],
    })
  })

  it('clamps out-of-range drop-index moves', () => {
    const orderItems = items.slice(0, 4)

    expect(getIds(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['b'],
      toIndex: -10,
    }).items)).toEqual(['b', 'a', 'c', 'hidden'])

    expect(getIds(moveCanvasSelectionItemsToIndex({
      getItemId,
      items: orderItems,
      selection: ['b'],
      toIndex: 99,
    }).items)).toEqual(['a', 'c', 'hidden', 'b'])
  })

  it('moves an item before or after a target item', () => {
    const orderItems = items.slice(0, 4)

    expect(moveCanvasItemToTargetPlacement({
      getItemId,
      itemId: 'a',
      items: orderItems,
      placement: 'after',
      targetItemId: 'hidden',
    })).toMatchObject({
      fromIndex: 0,
      items: [
        { id: 'b' },
        { id: 'c' },
        { id: 'hidden' },
        { id: 'a' },
      ],
      toIndex: 3,
    })

    expect(moveCanvasItemToTargetPlacement({
      getItemId,
      itemId: 'hidden',
      items: orderItems,
      placement: 'before',
      targetItemId: 'b',
    })).toMatchObject({
      fromIndex: 3,
      items: [
        { id: 'a' },
        { id: 'hidden' },
        { id: 'b' },
        { id: 'c' },
      ],
      toIndex: 1,
    })
  })

  it('returns null for target placement no-ops', () => {
    const orderItems = items.slice(0, 4)

    expect(moveCanvasItemToTargetPlacement({
      getItemId,
      itemId: 'b',
      items: orderItems,
      placement: 'before',
      targetItemId: 'c',
    })).toBeNull()
    expect(moveCanvasItemToTargetPlacement({
      getItemId,
      itemId: 'b',
      items: orderItems,
      placement: 'after',
      targetItemId: 'b',
    })).toBeNull()
    expect(moveCanvasItemToTargetPlacement({
      getItemId,
      itemId: 'missing',
      items: orderItems,
      placement: 'after',
      targetItemId: 'b',
    })).toBeNull()
  })

  it('inserts an item before or after a target item', () => {
    const orderItems = items.slice(0, 4)
    const item: TestItem = {
      id: 'x',
      kind: 'shape',
      rect: { h: 10, w: 10, x: 0, y: 0 },
    }

    expect(insertCanvasItemAtTargetPlacement({
      getItemId,
      item,
      items: orderItems,
      placement: 'before',
      targetItemId: 'b',
    })).toMatchObject({
      index: 1,
      items: [
        { id: 'a' },
        { id: 'x' },
        { id: 'b' },
        { id: 'c' },
        { id: 'hidden' },
      ],
    })

    expect(insertCanvasItemAtTargetPlacement({
      getItemId,
      item,
      items: orderItems,
      placement: 'after',
      targetItemId: 'hidden',
    })).toMatchObject({
      index: 4,
      items: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'hidden' },
        { id: 'x' },
      ],
    })
  })

  it('returns null when target placement insert target is missing', () => {
    const orderItems = items.slice(0, 4)
    const item: TestItem = {
      id: 'x',
      kind: 'shape',
      rect: { h: 10, w: 10, x: 0, y: 0 },
    }

    expect(insertCanvasItemAtTargetPlacement({
      getItemId,
      item,
      items: orderItems,
      placement: 'after',
      targetItemId: 'missing',
    })).toBeNull()
  })

  it('aligns selected item bounds to a provided frame', () => {
    expect(getCanvasAlignedBounds({
      bounds: { h: 20, w: 40, x: 0, y: 0 },
      frame: { h: 100, w: 200, x: 0, y: 0 },
      mode: 'alignCenter',
    })).toEqual({ h: 20, w: 40, x: 80, y: 0 })
    expect(getCanvasAlignmentDelta({
      bounds: { h: 20, w: 40, x: 0, y: 0 },
      frame: { h: 100, w: 200, x: 0, y: 0 },
      mode: 'alignBottom',
    })).toEqual({ x: 0, y: 80 })
    expect(alignCanvasRectList({
      entries: [{
        bounds: { h: 20, w: 40, x: 0, y: 0 },
        id: 'a',
      }],
      frame: { h: 100, w: 200, x: 0, y: 0 },
      mode: 'alignCenter',
    })).toEqual([{
      bounds: { h: 20, w: 40, x: 80, y: 0 },
      delta: { x: 80, y: 0 },
      id: 'a',
    }])

    expect(canAlignCanvasSelectionItems({
      frame: { h: 100, w: 200, x: 0, y: 0 },
      getItemBounds,
      getItemId,
      items,
      selection: ['a'],
    })).toBe(true)

    const aligned = alignCanvasSelectionItems({
      frame: { h: 100, w: 200, x: 0, y: 0 },
      getItemBounds,
      getItemId,
      items,
      mode: 'alignCenter',
      selection: ['a'],
      updateItemBounds,
    })

    expect(aligned.find((item) => item.id === 'a')?.rect).toMatchObject({ x: 80 })
    expect(aligned.find((item) => item.id === 'b')?.rect).toEqual(items[1].rect)
  })

  it('aligns multiple selected item bounds to their selection bounds', () => {
    const aligned = alignCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      mode: 'alignRight',
      selection: ['a', 'b'],
      updateItemBounds,
    })

    expect(aligned.find((item) => item.id === 'a')?.rect).toMatchObject({ x: 80 })
    expect(aligned.find((item) => item.id === 'b')?.rect).toMatchObject({ x: 100 })
  })

  it('distributes selected item bounds along an axis', () => {
    expect(distributeCanvasRectList({
      entries: [
        { bounds: { h: 20, w: 40, x: 0, y: 0 }, id: 'a' },
        { bounds: { h: 30, w: 20, x: 100, y: 10 }, id: 'b' },
        { bounds: { h: 10, w: 10, x: 20, y: 80 }, id: 'c' },
      ],
      mode: 'distributeHorizontal',
    })).toEqual([
      {
        bounds: { h: 20, w: 40, x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        id: 'a',
      },
      {
        bounds: { h: 30, w: 20, x: 100, y: 10 },
        delta: { x: 0, y: 0 },
        id: 'b',
      },
      {
        bounds: { h: 10, w: 10, x: 65, y: 80 },
        delta: { x: 45, y: 0 },
        id: 'c',
      },
    ])

    expect(canDistributeCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b', 'c'],
    })).toBe(true)

    const distributed = distributeCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      mode: 'distributeHorizontal',
      selection: ['a', 'b', 'c'],
      updateItemBounds,
    })

    expect(distributed.find((item) => item.id === 'a')?.rect).toMatchObject({ x: 0 })
    expect(distributed.find((item) => item.id === 'c')?.rect).toMatchObject({ x: 65 })
    expect(distributed.find((item) => item.id === 'b')?.rect).toMatchObject({ x: 100 })
  })

  it('blocks align and distribute when selection is too small or unsupported', () => {
    expect(canAlignCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a'],
    })).toBe(false)
    expect(canAlignCanvasSelectionItems({
      getItemBounds,
      getItemId,
      isItemSelectable,
      items,
      selection: ['a', 'hidden'],
    })).toBe(false)
    expect(canDistributeCanvasSelectionItems({
      getItemBounds,
      getItemId,
      items,
      selection: ['a', 'b'],
    })).toBe(false)
  })

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

function getIds(items: readonly TestItem[]) {
  return items.map((item) => item.id)
}
