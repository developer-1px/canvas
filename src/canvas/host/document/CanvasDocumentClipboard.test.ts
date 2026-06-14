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
  test('stores copied items in json-document document clipboard', () => {
    const document = createCanvasItemsDocument(INITIAL_ITEMS)

    expect(
      copyCanvasDocumentSelectionToClipboard(document, ['component-card']),
    ).toBe(true)

    expect(document.clipboard.hasData).toBe(true)
    expect(readCanvasDocumentClipboardItems(document).map((item) => item.id))
      .toEqual(['component-card'])
  })


  test('pastes json-document clipboard items through add patches', () => {
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


  test('commits duplicate clones through json-document add patches', () => {
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


  test('copies and pastes path items through validated document patches', () => {
    const pathItem: CanvasItem = {
      h: 74,
      id: 'path-1',
      opacity: 1,
      segments: [
        { point: { x: 20, y: 40 }, type: 'move' },
        {
          control1: { x: 50, y: 20 },
          control2: { x: 70, y: 90 },
          point: { x: 110, y: 60 },
          type: 'cubic',
        },
      ],
      stroke: '#334155',
      strokeWidth: 4,
      type: 'path',
      w: 94,
      x: 18,
      y: 18,
    }
    const document = createCanvasItemsDocument([pathItem])

    expect(copyCanvasDocumentSelectionToClipboard(document, ['path-1']))
      .toBe(true)

    const clones = cloneCanvasItemsWithNewIds(
      readCanvasDocumentClipboardItems(document),
      (prefix) => `${prefix}-pasted`,
      { x: 28, y: 28 },
    )

    expect(commitCanvasItemsPatch({
      document,
      patch: createAddCanvasItemsPatch(clones),
      selection: {
        before: ['path-1'],
        after: clones.map((item) => item.id),
      },
    })).toBe(true)
    expect(document.value.at(-1)).toMatchObject({
      id: 'path-pasted',
      segments: [
        { point: { x: 48, y: 68 }, type: 'move' },
        {
          control1: { x: 78, y: 48 },
          control2: { x: 98, y: 118 },
          point: { x: 138, y: 88 },
          type: 'cubic',
        },
      ],
      type: 'path',
    })
    expect(getCanvasDocumentSelectionIds(document)).toEqual(['path-pasted'])
  })

})
