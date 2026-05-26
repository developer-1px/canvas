import { describe, expect, test } from 'vitest'
import {
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  getCanvasDocumentSelectionIds,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import { cloneCanvasItemsWithNewIds } from '../operations/CanvasOperations'
import {
  copyCanvasDocumentSelectionToClipboard,
  readCanvasDocumentClipboardItems,
  writeCanvasDocumentClipboardItems,
} from './CanvasDocumentClipboard'
import { createAddCanvasItemsPatch } from './CanvasDocumentPatches'
import type { CanvasItem } from '../model'

describe('CanvasDocument clipboard commits', () => {
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


  test('contains invalid drawing items at the document clipboard seam', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
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
    const invalidMarkerItem = {
      ...markerItem,
      opacity: 0,
    }

    expect(
      writeCanvasDocumentClipboardItems(document, [invalidMarkerItem]),
    ).toBe(false)
    expect(readCanvasDocumentClipboardItems(document)).toEqual([])

    expect(writeCanvasDocumentClipboardItems(document, [markerItem])).toBe(true)
    document.clipboard.write([invalidMarkerItem])

    expect(readCanvasDocumentClipboardItems(document)).toEqual([])
  })


  test('commits duplicate clones through zod-crud add patches', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)
    const clones = cloneCanvasItemsWithNewIds(
      [INITIAL_ITEMS[2]],
      (prefix) => `${prefix}-duplicated`,
      { x: 28, y: 28 },
    )

    expect(
      commitCanvasItemsPatch({
        document,
        patch: createAddCanvasItemsPatch(clones),
        selection: {
          before: ['component-card'],
          after: clones.map((item) => item.id),
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual([{
      op: 'add',
      path: `/${INITIAL_ITEMS.length}`,
      value: clones[0],
    }])
    expect(document.value.at(-1)).toMatchObject({
      id: 'component-duplicated',
      x: 588,
      y: 116,
    })
    expect(getCanvasDocumentSelectionIds(document)).toEqual([
      'component-duplicated',
    ])

    expect(document.history.undo()).toBe(true)
    expect(document.value.map((item) => item.id)).not.toContain(
      'component-duplicated',
    )
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['component-card'])
  })

})
