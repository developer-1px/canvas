import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasTextPasteItems,
  getCanvasTextPasteInsertPosition,
  getCanvasTextPasteSourcesFromDataTransfer,
  insertCanvasTextPasteSource,
} from './CanvasTextPasteImport'
import type { CanvasTextPasteImporter } from './CanvasTextPasteImporters'

describe('CanvasTextPasteImport', () => {
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
