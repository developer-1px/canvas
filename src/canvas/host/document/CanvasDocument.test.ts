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
import {
  groupCanvasSelection,
  cloneCanvasItemsWithNewIds,
  removeCanvasItems,
} from '../operations/CanvasOperations'
import {
  copyCanvasDocumentSelectionToClipboard,
  readCanvasDocumentClipboardItems,
  writeCanvasDocumentClipboardItems,
} from './CanvasDocumentClipboard'
import {
  createAddCanvasItemsPatch,
  createRemoveCanvasItemsPatch,
} from './CanvasDocumentPatches'

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

  test('stores copied items in zod-crud document clipboard', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)

    expect(
      copyCanvasDocumentSelectionToClipboard(document, ['component-card']),
    ).toBe(true)

    expect(document.clipboard.hasData).toBe(true)
    expect(readCanvasDocumentClipboardItems(document).map((item) => item.id))
      .toEqual(['component-card'])
  })

  test('pastes zod-crud clipboard items through add patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)

    expect(
      copyCanvasDocumentSelectionToClipboard(document, ['component-card']),
    ).toBe(true)

    const clones = cloneCanvasItemsWithNewIds(
      readCanvasDocumentClipboardItems(document),
      (prefix) => `${prefix}-pasted`,
      { x: 28, y: 28 },
    )
    const didCommit = commitCanvasItemsPatch({
      document,
      patch: createAddCanvasItemsPatch(clones),
      selection: {
        before: ['component-card'],
        after: clones.map((item) => item.id),
      },
    })

    expect(didCommit).toBe(true)
    expect(writeCanvasDocumentClipboardItems(document, clones)).toBe(true)
    expect(document.lastPatch.map((operation) => operation.op)).toEqual(['add'])
    expect(document.value.at(-1)).toMatchObject({
      id: 'component-pasted',
      x: 588,
      y: 116,
    })
    expect(readCanvasDocumentClipboardItems(document).map((item) => item.id))
      .toEqual(['component-pasted'])
    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-pasted',
    ])
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
