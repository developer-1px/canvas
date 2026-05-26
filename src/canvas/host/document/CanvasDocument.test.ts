import { describe, expect, test } from 'vitest'
import {
  commitCanvasDocumentSelection,
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
  restoreCanvasDocumentSelection,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import { groupCanvasSelection } from '../operations/CanvasOperations'

describe('CanvasDocument selection history', () => {
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
      commitCanvasItemsPatch({
        document,
        patch: [{
          op: 'replace',
          path: '/2',
          value: nextItems[2],
        }],
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


  test('commits selection-only changes as zod-crud mutation diffs', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS, {
      selection: ['component-sticky'],
    })

    expect(
      commitCanvasDocumentSelection(document, ['component-card']),
    ).toBe(true)
    expect(document.value).toEqual(INITIAL_ITEMS)
    expect(document.canUndo()).toEqual({ ok: true })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])

    expect(document.history.undo()).toBe(true)
    expect(document.value).toEqual(INITIAL_ITEMS)
    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-sticky',
    ])

    expect(document.history.redo()).toBe(true)
    expect(document.value).toEqual(INITIAL_ITEMS)
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])
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
