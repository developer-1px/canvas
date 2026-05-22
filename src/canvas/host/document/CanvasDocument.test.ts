import { describe, expect, test } from 'vitest'
import {
  commitCanvasDocumentSelection,
  commitCanvasItemsDocument,
  commitCanvasItemsPatch,
  createReplaceCanvasDocumentTextPatch,
  createCanvasItemsDocument,
  findCanvasDocumentText,
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
  createResizeCanvasItemsPatch,
  createSetCanvasItemTextPatch,
} from './CanvasDocumentPatches'
import type { CanvasItem } from '../model/CanvasModel'

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

  test('finds searchable canvas text fields through zod-crud query', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)

    expect(findCanvasDocumentText(document, 'concept')).toEqual([
      {
        field: 'body',
        itemId: 'component-card',
        occurrences: 1,
        path: '/2/body',
        value: 'Concept block',
      },
    ])
  })

  test('commits find replace as zod-crud replace patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
    const patch = createReplaceCanvasDocumentTextPatch(
      document,
      'Concept',
      'Content',
    )

    expect(patch).toEqual([
      {
        op: 'replace',
        path: '/2/body',
        value: 'Content block',
      },
    ])
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
    expect(findCanvasDocumentText(document, 'Content')).toEqual([
      {
        field: 'body',
        itemId: 'component-card',
        occurrences: 1,
        path: '/2/body',
        value: 'Content block',
      },
    ])
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])
  })

  test('commits text editing as a zod-crud replace patch', () => {
    const items: CanvasItem[] = [{
      h: 48,
      id: 'text-1',
      text: 'Draft',
      type: 'text',
      w: 120,
      x: 10,
      y: 20,
    }]
    const document = createCanvasItemsDocument(items, {
      selection: ['text-1'],
    })
    const patch = createSetCanvasItemTextPatch(items, 'text-1', 'Final')

    expect(patch).toEqual([{
      op: 'replace',
      path: '/0/text',
      value: 'Final',
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['text-1'],
          after: ['text-1'],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual(patch)
    expect(document.value[0]).toMatchObject({ text: 'Final' })

    expect(document.history.undo()).toBe(true)
    expect(document.value[0]).toMatchObject({ text: 'Draft' })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['text-1'])
  })

  test('commits empty rect text editing as a zod-crud add patch', () => {
    const items: CanvasItem[] = [{
      fill: '#ffffff',
      h: 48,
      id: 'rect-1',
      stroke: '#111111',
      type: 'rect',
      w: 120,
      x: 10,
      y: 20,
    }]
    const document = createCanvasItemsDocument(items, {
      selection: ['rect-1'],
    })
    const patch = createSetCanvasItemTextPatch(items, 'rect-1', 'Label')

    expect(patch).toEqual([{
      op: 'add',
      path: '/0/text',
      value: 'Label',
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['rect-1'],
          after: ['rect-1'],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual(patch)
    expect(document.value[0]).toMatchObject({ text: 'Label' })
  })

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
