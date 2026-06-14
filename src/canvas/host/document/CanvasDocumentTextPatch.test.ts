import { describe, expect, test } from 'vitest'
import {
  commitCanvasItemsPatch,
  createReplaceCanvasDocumentTextPatch,
  createCanvasItemsDocument,
  findCanvasDocumentText,
  getCanvasDocumentSelectionIds,
} from './CanvasDocument'
import { INITIAL_ITEMS } from '../component/CanvasInitialItems'
import { createSetCanvasItemTextPatch } from './CanvasDocumentPatches'
import type { CanvasItem } from '../model'

describe('CanvasDocument text patches', () => {
  test('finds searchable canvas text fields through search-replace', () => {
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


  test('finds and replaces comment thread message bodies', () => {
    const document = createCanvasItemsDocument([{
      body: 'Legacy summary',
      h: 36,
      id: 'comment-1',
      thread: [{
        authorName: 'Ari',
        body: '@bo please review this',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
      type: 'comment',
      w: 36,
      x: 10,
      y: 20,
    }])

    expect(findCanvasDocumentText(document, '@bo')).toEqual([
      {
        field: 'body',
        itemId: 'comment-1',
        occurrences: 1,
        path: '/0/thread/0/body',
        value: '@bo please review this',
      },
    ])
    expect(createReplaceCanvasDocumentTextPatch(
      document,
      '@bo',
      '@ari',
    )).toEqual([{
      op: 'replace',
      path: '/0/thread/0/body',
      value: '@ari please review this',
    }])
  })


  test('does not search canvas storage identity fields', () => {
    const document = createCanvasItemsDocument([{
      fill: '#ffffff',
      h: 48,
      id: 'concept-id',
      stroke: '#111111',
      type: 'rect',
      w: 120,
      x: 10,
      y: 20,
    }])

    expect(findCanvasDocumentText(document, 'concept-id')).toEqual([])
    expect(findCanvasDocumentText(document, 'rect')).toEqual([])
  })


  test('commits find replace as json-document replace patches', () => {
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


  test('replaces all occurrences inside searchable fields', () => {
    const document = createCanvasItemsDocument([{
      h: 48,
      id: 'text-1',
      text: 'draft draft',
      type: 'text',
      w: 120,
      x: 10,
      y: 20,
    }])
    const patch = createReplaceCanvasDocumentTextPatch(
      document,
      'draft',
      'final',
    )

    expect(patch).toEqual([{
      op: 'replace',
      path: '/0/text',
      value: 'final final',
    }])
  })


  test('commits text editing as a json-document replace patch', () => {
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


  test('commits sticky text editing as a json-document body replace patch', () => {
    const items: CanvasItem[] = [{
      accent: '#ca8a04',
      body: 'Draft idea',
      component: 'sticky',
      fill: '#fef3c7',
      h: 148,
      id: 'component-sticky',
      stroke: '#eab308',
      title: 'Sticky',
      type: 'component',
      w: 188,
      x: 10,
      y: 20,
    }]
    const document = createCanvasItemsDocument(items, {
      selection: ['component-sticky'],
    })
    const patch = createSetCanvasItemTextPatch(
      items,
      'component-sticky',
      'Final idea',
    )

    expect(patch).toEqual([{
      op: 'replace',
      path: '/0/body',
      value: 'Final idea',
    }])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['component-sticky'],
          after: ['component-sticky'],
        },
      }),
    ).toBe(true)

    expect(document.lastPatch).toEqual(patch)
    expect(document.value[0]).toMatchObject({ body: 'Final idea' })
  })


  test('commits empty rect text editing as a json-document add patch', () => {
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


  test('commits comment text edits to the body and first thread message', () => {
    const items: CanvasItem[] = [{
      body: 'Draft',
      h: 36,
      id: 'comment-1',
      thread: [{
        authorName: 'Ari',
        body: 'Draft',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
      type: 'comment',
      w: 36,
      x: 10,
      y: 20,
    }]
    const document = createCanvasItemsDocument(items, {
      selection: ['comment-1'],
    })
    const patch = createSetCanvasItemTextPatch(items, 'comment-1', 'Final')

    expect(patch).toEqual([
      {
        op: 'replace',
        path: '/0/body',
        value: 'Final',
      },
      {
        op: 'replace',
        path: '/0/thread/0/body',
        value: 'Final',
      },
    ])
    expect(
      commitCanvasItemsPatch({
        document,
        patch,
        selection: {
          before: ['comment-1'],
          after: ['comment-1'],
        },
      }),
    ).toBe(true)

    expect(document.value[0]).toMatchObject({
      body: 'Final',
      thread: [{
        authorName: 'Ari',
        body: 'Final',
        createdAt: '2026-06-02T00:00:00.000Z',
        id: 'message-1',
      }],
    })
  })

})
