import { describe, expect, test } from 'vitest'
import {
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import {
  alignCanvasSelection,
  lockCanvasSelection,
  translateCanvasItems,
} from '../operations/CanvasOperations'
import {
  createReorderCanvasItemsPatch,
  createReplaceChangedCanvasItemsPatch,
  createResizeCanvasItemsPatch,
  createTransformCanvasItemsPatch,
} from './CanvasDocumentPatches'
import type { CanvasItem } from '../model'

describe('CanvasDocument transform patches', () => {
  test('commits inspector bounds edits as zod-crud replace patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-card'],
    })
    const card = INITIAL_ITEMS[2]

    expect(card).toMatchObject({
      h: 128,
      id: 'component-card',
      w: 220,
      x: 560,
      y: 88,
    })

    const patch = createResizeCanvasItemsPatch(
      INITIAL_ITEMS,
      ['component-card'],
      { x: 560, y: 88, w: 220, h: 128 },
      { x: 600, y: 88, w: 220, h: 128 },
    )

    expect(patch).toEqual([{
      op: 'replace',
      path: '/2',
      value: {
        ...card,
        x: 600,
      },
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-card'],
          after: ['component-card'],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual(patch)
    expect(document.value[2]).toMatchObject({ id: 'component-card', x: 600 })

    expect(document.history.undo()).toBe(true)
    expect(document.value[2]).toMatchObject({ id: 'component-card', x: 560 })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])
  })


  test('commits alignment results as zod-crud replace patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-sticky', 'component-card'],
    })
    const nextItems = alignCanvasSelection(
      INITIAL_ITEMS,
      ['component-sticky', 'component-card'],
      'alignLeft',
    )
    const patch = createReplaceChangedCanvasItemsPatch(INITIAL_ITEMS, nextItems)

    expect(patch).toEqual([{
      op: 'replace',
      path: '/2',
      value: {
        ...INITIAL_ITEMS[2],
        x: 92,
      },
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-sticky', 'component-card'],
          after: ['component-sticky', 'component-card'],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual(patch)
    expect(document.value[2]).toMatchObject({ id: 'component-card', x: 92 })
  })


  test('commits lock and nudge results as zod-crud replace patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-card'],
    })
    const locked = lockCanvasSelection(INITIAL_ITEMS, ['component-card'])
    const lockPatch = createReplaceChangedCanvasItemsPatch(
      INITIAL_ITEMS,
      locked.items,
    )

    expect(lockPatch).toEqual([{
      op: 'replace',
      path: '/2',
      value: {
        ...INITIAL_ITEMS[2],
        locked: true,
      },
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch: lockPatch,
        selection: {
          before: ['component-card'],
          after: locked.selection,
        },
      }),
    ).toBe(true)

    expect(document.value[2]).toMatchObject({
      id: 'component-card',
      locked: true,
    })
    expect(getCanvasDocumentSelectionIds(document)).toEqual([])

    expect(document.history.undo()).toBe(true)
    expect(document.value[2]).toMatchObject({ id: 'component-card' })
    expect(document.value[2]).not.toHaveProperty('locked')
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])

    const nudged = translateCanvasItems(INITIAL_ITEMS, ['component-card'], 8, 0)
    const nudgePatch = createReplaceChangedCanvasItemsPatch(
      INITIAL_ITEMS,
      nudged,
    )

    expect(nudgePatch).toEqual([{
      op: 'replace',
      path: '/2',
      value: {
        ...INITIAL_ITEMS[2],
        x: 568,
      },
    }])
  })


  test('commits z-order changes as layer-order replace patches', () => {
    const items: CanvasItem[] = [
      rectItem('a'),
      rectItem('b'),
      rectItem('c'),
      rectItem('d'),
    ]
    const document = createCanvasItemsDocument(items, {
      selection: ['b', 'd'],
    })
    const patch = createReorderCanvasItemsPatch(
      items,
      ['b', 'd'],
      'bringForward',
    )

    expect(patch).toEqual([{
      op: 'replace',
      path: '',
      value: [items[0], items[2], items[1], items[3]],
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['b', 'd'],
          after: ['b', 'd'],
        },
      }),
    ).toBe(true)

    expect(document.value.map((item) => item.id)).toEqual([
      'a',
      'c',
      'b',
      'd',
    ])
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['b', 'd'])

    expect(document.history.undo()).toBe(true)
    expect(document.value.map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['b', 'd'])
  })


  test('commits pointer transform previews as zod-crud patches', () => {
    const items: CanvasItem[] = [
      rectItem('a'),
      rectItem('b'),
    ]
    const moved = translateCanvasItems(items, ['a'], 24, 0)
    const clone: CanvasItem = {
      ...rectItem('clone'),
      x: 80,
    }
    const document = createCanvasItemsDocument(items, {
      selection: ['a'],
    })
    const patch = createTransformCanvasItemsPatch(items, [...moved, clone])

    expect(patch).toEqual([
      {
        op: 'replace',
        path: '/0',
        value: {
          ...items[0],
          x: 24,
        },
      },
      {
        op: 'add',
        path: '/-',
        value: clone,
      },
    ])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['a'],
          after: ['clone'],
        },
      }),
    ).toBe(true)

    expect(document.value.map((item) => item.id)).toEqual(['a', 'b', 'clone'])
    expect(document.value[0]).toMatchObject({ id: 'a', x: 24 })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['clone'])

    expect(document.history.undo()).toBe(true)
    expect(document.value.map((item) => item.id)).toEqual(['a', 'b'])
    expect(document.value[0]).toMatchObject({ id: 'a', x: 0 })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['a'])
  })

})

function rectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}
