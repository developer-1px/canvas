import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_TEXT_PASTE_IMPORT_MODEL,
  createCanvasPlainTextPasteSource,
  createCanvasTextPasteItems,
  getCanvasRichTextPasteSourceFromHTML,
  getCanvasTextPasteInsertPosition,
  getCanvasTextPasteSourceCandidatesFromDataTransfer,
  getCanvasTextPasteSourcesFromDataTransfer,
  insertCanvasTextPasteSource,
  routeCanvasTextPasteReplace,
} from './CanvasTextPasteImport'
import type { CanvasTextPasteImporter } from './CanvasTextPasteImporters'

describe('CanvasTextPasteImport', () => {
  it('exposes a stable model metadata value', () => {
    expect(CANVAS_TEXT_PASTE_IMPORT_MODEL).toBe('canvas-text-paste-import')
  })

  it('reads plain text before HTML clipboard text as fallback sources', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === 'text/plain'
          ? '<main>Plain HTML</main>'
          : '<section>Rich HTML</section>',
      ),
    } as unknown as DataTransfer

    expect(getCanvasTextPasteSourcesFromDataTransfer(dataTransfer)).toEqual([
      '<main>Plain HTML</main>',
      '<section>Rich HTML</section>',
    ])
  })

  it('deduplicates identical clipboard text sources', () => {
    const dataTransfer = {
      getData: vi.fn(() => '<main>Same</main>'),
    } as unknown as DataTransfer

    expect(getCanvasTextPasteSourcesFromDataTransfer(dataTransfer)).toEqual([
      '<main>Same</main>',
    ])
  })

  it('creates common text paste source candidates with rich source first', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === 'text/html'
          ? '<p>Hello <strong>Bold</strong></p>'
          : 'Plain fallback',
      ),
    } as unknown as DataTransfer

    expect(getCanvasTextPasteSourceCandidatesFromDataTransfer(dataTransfer))
      .toEqual([
        {
          format: 'text-html-rich',
          paragraphs: [
            {
              runs: [
                { text: 'Hello ' },
                { bold: true, text: 'Bold' },
              ],
            },
          ],
          text: 'Hello Bold',
        },
        {
          format: 'text-plain',
          text: 'Plain fallback',
        },
      ])
  })

  it('normalizes rich HTML clipboard text into paragraph and run metadata', () => {
    expect(getCanvasRichTextPasteSourceFromHTML(`
      <section>
        <p>Hello <strong>Bold</strong><br><a href="https://example.com">Link</a></p>
        <ul><li><em>Item</em> <u>Done</u></li></ul>
      </section>
    `)).toEqual({
      format: 'text-html-rich',
      paragraphs: [
        {
          runs: [
            { text: 'Hello ' },
            { bold: true, text: 'Bold' },
          ],
        },
        {
          runs: [
            {
              color: '#2563eb',
              link: 'https://example.com',
              text: 'Link',
              underline: true,
            },
          ],
        },
        {
          bullet: 'bullet',
          runs: [
            { italic: true, text: 'Item' },
            { text: 'Done', underline: true },
          ],
        },
      ],
      text: 'Hello Bold\nLink\nItemDone',
    })
  })

  it('does not claim plain or conflicting HTML as rich text', () => {
    expect(getCanvasRichTextPasteSourceFromHTML('<p>Plain text</p>')).toBeNull()
    expect(getCanvasRichTextPasteSourceFromHTML(
      '<table><tr><td>Cell</td></tr></table>',
    )).toBeNull()
    expect(getCanvasRichTextPasteSourceFromHTML(
      '<p><img src="data:image/png;base64,aW1hZ2U="></p>',
    )).toBeNull()
  })

  it('routes a plain text paste source to a host text replace target', () => {
    const source = createCanvasPlainTextPasteSource('  Hello text  ')
    const getTarget = vi.fn(() => ({
      id: 'text-1',
      selection: ['text-1'],
    }))

    expect(source).toEqual({
      format: 'text-plain',
      text: 'Hello text',
    })

    const route = routeCanvasTextPasteReplace({
      getTarget,
      selection: ['text-1'],
      source: source!,
    })

    expect(route).toEqual({
      intent: {
        kind: 'text-replace',
        source,
        target: {
          id: 'text-1',
          selection: ['text-1'],
        },
        text: 'Hello text',
      },
      kind: 'text-replace',
      source,
      status: 'routed',
      text: 'Hello text',
    })
    expect(Object.isFrozen(route)).toBe(true)
    expect(getTarget).toHaveBeenCalledWith({
      selection: ['text-1'],
      source,
      text: 'Hello text',
    })
  })

  it('routes a rich HTML paste source with paragraph metadata', () => {
    const source = getCanvasRichTextPasteSourceFromHTML(`
      <p>Hello <strong>Bold</strong></p>
    `)
    const route = routeCanvasTextPasteReplace({
      getTarget: ({ selection }) => ({
        id: selection[0] ?? 'text-1',
        selection,
      }),
      selection: ['text-1'],
      source: source!,
    })

    expect(route).toMatchObject({
      intent: {
        kind: 'text-replace',
        source: {
          format: 'text-html-rich',
          paragraphs: [
            {
              runs: [
                { text: 'Hello ' },
                { bold: true, text: 'Bold' },
              ],
            },
          ],
          text: 'Hello Bold',
        },
        target: {
          id: 'text-1',
          selection: ['text-1'],
        },
        text: 'Hello Bold',
      },
      kind: 'text-replace',
      status: 'routed',
      text: 'Hello Bold',
    })
  })

  it('falls back to text insertion when replace target is unavailable', () => {
    const source = createCanvasPlainTextPasteSource('Hello text')!
    const route = routeCanvasTextPasteReplace({
      getTarget: () => null,
      selection: [],
      source,
    })

    expect(route).toEqual({
      kind: 'text-insert',
      reason: 'no-target',
      source,
      status: 'fallback',
      text: 'Hello text',
    })
    expect(Object.isFrozen(route)).toBe(true)
  })

  it('lets hosts disable text replacement before target lookup', () => {
    const getTarget = vi.fn(() => ({
      id: 'text-1',
      selection: ['text-1'],
    }))
    const source = {
      format: 'text-plain' as const,
      text: '   ',
    }

    expect(routeCanvasTextPasteReplace({
      disabled: true,
      getTarget,
      selection: ['text-1'],
      source: createCanvasPlainTextPasteSource('Hello text')!,
    })).toEqual({
      kind: 'text-insert',
      reason: 'disabled',
      source: {
        format: 'text-plain',
        text: 'Hello text',
      },
      status: 'fallback',
      text: 'Hello text',
    })
    expect(routeCanvasTextPasteReplace({
      getTarget,
      selection: ['text-1'],
      source,
    })).toEqual({
      kind: 'text-insert',
      reason: 'empty-source',
      source,
      status: 'fallback',
      text: '   ',
    })
    expect(getTarget).not.toHaveBeenCalled()
  })

  it('uses the first importer that can create canvas items', () => {
    const skipImporter: CanvasTextPasteImporter = {
      id: 'skip',
      createItems: vi.fn(() => null),
    }
    const htmlImporter: CanvasTextPasteImporter = {
      id: 'html',
      createItems: vi.fn(({ createId, position }) => [{
        data: { html: '<button>Save</button>' },
        h: 80,
        id: createId('html'),
        kind: 'html',
        presentation: 'html',
        title: 'HTML',
        type: 'custom',
        w: 160,
        x: position.x,
        y: position.y,
      } as const]),
    }

    expect(createCanvasTextPasteItems({
      createId: (prefix) => `${prefix}-1`,
      importers: [skipImporter, htmlImporter],
      position: { x: 120, y: 80 },
      text: '  <button>Save</button>  ',
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      importerId: 'html',
      items: [
        expect.objectContaining({
          id: 'html-1',
          x: 120,
          y: 80,
        }),
      ],
    })
    expect(skipImporter.createItems).toHaveBeenCalled()
    expect(htmlImporter.createItems).toHaveBeenCalledWith(
      expect.objectContaining({
        text: '<button>Save</button>',
      }),
    )
  })

  it('commits imported items and selects them', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasTextPasteSource({
      context: {
        commitItemsChange,
        createId: (prefix) => `${prefix}-1`,
        selection: ['rect-1'],
      },
      importers: [{
        id: 'html',
        createItems: ({ createId, position }) => [{
          data: { html: '<main />' },
          h: 120,
          id: createId('html'),
          kind: 'html',
          presentation: 'html',
          title: 'HTML',
          type: 'custom',
          w: 240,
          x: position.x,
          y: position.y,
        } as const],
      }],
      position: { x: 200, y: 140 },
      text: '<main />',
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-1',
            x: 200,
            y: 140,
          }),
        ],
        type: 'add',
      },
      {
        after: ['html-1'],
        before: ['rect-1'],
      },
    )
  })

  it('derives insert position from screen coordinates or viewport center', () => {
    const stageElement = {
      getScreenPoint: vi.fn(() => ({ x: 410, y: 260 })),
      getViewportCenter: vi.fn(() => ({ x: 100, y: 120 })),
    }
    const viewport = { scale: 2, x: 10, y: 20 }

    expect(getCanvasTextPasteInsertPosition({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 200, y: 120 })
    expect(getCanvasTextPasteInsertPosition({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport: { scale: Number.NaN, x: 10, y: 20 },
    })).toEqual({ x: 4000, y: 2400 })
    expect(getCanvasTextPasteInsertPosition({
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 100, y: 120 })
  })
})
