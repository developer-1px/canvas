import { describe, expect, test } from 'vitest'
import {
  commitCanvasItemsDocument,
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
  restoreCanvasDocumentSelection,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import { createCanvasComponentItem } from '../component/CanvasComponentFactory'
import { groupCanvasSelection } from '../operations/CanvasOperations'

describe('CanvasDocument history', () => {
  test('seeds zod-crud document selection from canvas ids', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-sticky', 'component-card'],
    })

    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-sticky',
      'component-card',
    ])

    restoreCanvasDocumentSelection(document, ['component-label'])

    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-label'])
  })

  test('uses zod-crud document history for undo and redo', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
    const nextItems = INITIAL_ITEMS.map((item) =>
      item.id === 'component-card' ? { ...item, x: item.x + 40 } : item,
    )

    expect(
      commitCanvasItemsDocument({
        document,
        nextItems,
        selection: {
          before: ['component-sticky'],
          after: ['component-card'],
        },
      }),
    ).toBe(true)
    expect(document.canUndo()).toEqual({ ok: true })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])

    expect(document.history.undo()).toBe(true)
    expect(document.value).toEqual(INITIAL_ITEMS)
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-sticky'])

    expect(document.history.redo()).toBe(true)
    expect(document.value).toEqual(nextItems)
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])
  })

  test('commits item creation as a zod-crud add patch', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
    const nextItem = createCanvasComponentItem({
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

  test('round-trips document selection through JSON pointers', () => {
    const grouped = groupCanvasSelection(
      INITIAL_ITEMS,
      ['component-sticky', 'component-label'],
      'group-1',
    ).items
    const document = createCanvasItemsDocument(grouped)

    restoreCanvasDocumentSelection(document, [
      'group-1',
      'component-sticky',
      'component-label',
    ])

    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'group-1',
      'component-sticky',
      'component-label',
    ])
  })
})
