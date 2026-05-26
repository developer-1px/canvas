import { describe, expect, test } from 'vitest'
import {
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import { CANVAS_COMPONENT_LIBRARY } from '../component/CanvasComponentLibrary'
import {
  groupCanvasSelection,
  removeCanvasItems,
  ungroupCanvasSelection,
} from '../operations/CanvasOperations'
import {
  createGroupCanvasItemsPatch,
  createRemoveCanvasItemsPatch,
  createUngroupCanvasItemsPatch,
} from './CanvasDocumentPatches'

describe('CanvasDocument item patch commits', () => {
  test('commits item creation as a zod-crud add patch', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
    const nextItem = CANVAS_COMPONENT_LIBRARY.createItem({
      id: 'component-created',
      point: { x: 120, y: 140 },
      templateId: 'card',
    })

    expect(
      commitCanvasItemsPatch({
        document,
        patch: [{ op: 'add', path: '/-', value: nextItem }],
        selection: {
          before: [],
          after: [nextItem.id],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual([
      {
        op: 'add',
        path: `/${INITIAL_ITEMS.length}`,
        value: nextItem,
      },
    ])
    expect(document.value.at(-1)).toEqual(nextItem)
    expect(getCanvasDocumentSelectionIds(document)).toEqual([nextItem.id])
  })


  test('commits top-level deletion as zod-crud remove patch', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-card'],
    })
    const patch = createRemoveCanvasItemsPatch(INITIAL_ITEMS, [
      'component-card',
    ])

    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-card'],
          after: [],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual([{ op: 'remove', path: '/2' }])
    expect(document.value.map((item) => item.id)).not.toContain('component-card')
    expect(getCanvasDocumentSelectionIds(document)).toEqual([])
  })


  test('commits nested deletion with group bounds patch', () => {
    const grouped = groupCanvasSelection(
      INITIAL_ITEMS,
      ['component-sticky', 'component-label'],
      'group-1',
    ).items
    const expected = removeCanvasItems(grouped, ['component-label'])
    const document = createCanvasItemsDocument(grouped, {
      selection: ['component-label'],
    })
    const patch = createRemoveCanvasItemsPatch(grouped, ['component-label'])

    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-label'],
          after: [],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch.map((operation) => operation.op)).toEqual([
      'remove',
      'replace',
    ])
    expect(document.lastPatch[0]).toEqual({
      op: 'remove',
      path: '/0/children/1',
    })
    expect(document.value).toEqual(expected)
    expect(getCanvasDocumentSelectionIds(document)).toEqual([])
  })


  test('commits grouping as zod-crud remove and add patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-sticky', 'component-label'],
    })
    const result = groupCanvasSelection(
      INITIAL_ITEMS,
      ['component-sticky', 'component-label'],
      'group-1',
    )
    const patch = createGroupCanvasItemsPatch(
      INITIAL_ITEMS,
      ['component-sticky', 'component-label'],
      'group-1',
    )

    expect(patch.map((operation) => operation.op)).toEqual([
      'remove',
      'remove',
      'add',
    ])
    expect(patch[0]).toEqual({ op: 'remove', path: '/1' })
    expect(patch[1]).toEqual({ op: 'remove', path: '/0' })
    expect(patch[2]).toMatchObject({
      op: 'add',
      path: '/0',
      value: {
        id: 'group-1',
        type: 'group',
      },
    })
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-sticky', 'component-label'],
          after: result.selection,
        },
      }),
    ).toBe(true)

    expect(document.value).toEqual(result.items)
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['group-1'])

    expect(document.history.undo()).toBe(true)
    expect(document.value).toEqual(INITIAL_ITEMS)
    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-sticky',
      'component-label',
    ])
  })


  test('commits ungrouping as zod-crud remove and add patches', () => {
    const grouped = groupCanvasSelection(
      INITIAL_ITEMS,
      ['component-sticky', 'component-label'],
      'group-1',
    ).items
    const result = ungroupCanvasSelection(grouped, ['group-1'])
    const document = createCanvasItemsDocument(grouped, {
      selection: ['group-1'],
    })
    const patch = createUngroupCanvasItemsPatch(grouped, ['group-1'])

    expect(patch.map((operation) => operation.op)).toEqual([
      'remove',
      'add',
      'add',
    ])
    expect(patch[0]).toEqual({ op: 'remove', path: '/0' })
    expect(patch[1]).toMatchObject({
      op: 'add',
      path: '/0',
      value: { id: 'component-sticky' },
    })
    expect(patch[2]).toMatchObject({
      op: 'add',
      path: '/1',
      value: { id: 'component-label' },
    })
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['group-1'],
          after: result.selection,
        },
      }),
    ).toBe(true)

    expect(document.value).toEqual(result.items)
    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-sticky',
      'component-label',
    ])
  })

})
