import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasMediaImportItems,
  getCanvasMediaInsertPosition,
  getCanvasMediaSourceFromDataTransfer,
  getCanvasMediaSourceFromText,
  insertCanvasMediaSource,
} from './CanvasMediaImport'
import type { CanvasMediaImporter } from './CanvasMediaImporters'

describe('CanvasMediaImport', () => {
  it('extracts URL sources from plain URLs and embed snippets', () => {
    expect(getCanvasMediaSourceFromText(
      'https://www.figma.com/figjam/',
    )).toEqual({
      url: 'https://www.figma.com/figjam/',
    })
    expect(getCanvasMediaSourceFromText(
      '<iframe src="https://www.youtube.com/embed/demo"></iframe>',
    )).toEqual({
      url: 'https://www.youtube.com/embed/demo',
    })
  })

  it('reads text/uri-list before plain text from data transfer', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) =>
        type === 'text/uri-list'
          ? 'https://docs.example.com/reference'
          : 'https://fallback.example.com',
      ),
    } as unknown as DataTransfer

    expect(getCanvasMediaSourceFromDataTransfer(dataTransfer)).toEqual({
      url: 'https://docs.example.com/reference',
    })
  })

  it('uses the first media importer that can create canvas items', () => {
    const skipImporter: CanvasMediaImporter = {
      id: 'skip',
      createItems: vi.fn(() => null),
    }
    const embedImporter: CanvasMediaImporter = {
      id: 'video-embed',
      createItems: vi.fn(({ createId, position, source, viewport }) => [{
        data: {
          scale: viewport.scale,
          url: source.url,
        },
        h: 120,
        id: createId('embed'),
        kind: 'video',
        presentation: 'embed',
        title: 'Video',
        type: 'custom',
        w: 220,
        x: position.x,
        y: position.y,
      } as const]),
    }

    expect(createCanvasMediaImportItems({
      createId: (prefix) => `${prefix}-1`,
      importers: [skipImporter, embedImporter],
      position: { x: 120, y: 80 },
      source: { url: ' https://youtu.be/demo ' },
      viewport: { scale: 2, x: 10, y: 20 },
    })).toEqual({
      importerId: 'video-embed',
      items: [
        expect.objectContaining({
          id: 'embed-1',
          x: 120,
          y: 80,
        }),
      ],
    })
    expect(skipImporter.createItems).toHaveBeenCalled()
    expect(embedImporter.createItems).toHaveBeenCalledWith(
      expect.objectContaining({
        source: { url: 'https://youtu.be/demo' },
        viewport: { scale: 2, x: 10, y: 20 },
      }),
    )
  })

  it('falls back to a safe link preview when a provider fails', () => {
    const failingImporter: CanvasMediaImporter = {
      id: 'provider',
      createItems: vi.fn(() => {
        throw new Error('provider unavailable')
      }),
    }

    expect(createCanvasMediaImportItems({
      createId: (prefix) => `${prefix}-1`,
      importers: [failingImporter],
      position: { x: 300, y: 200 },
      source: { url: 'https://www.figma.com/figjam/' },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual({
      importerId: 'link-preview',
      items: [
        expect.objectContaining({
          component: 'link-preview',
          id: 'component-1',
          title: 'figma.com',
          url: 'https://www.figma.com/figjam/',
          x: 140,
          y: 126,
        }),
      ],
    })
  })

  it('commits imported media items and selects them', () => {
    const commitItemsChange = vi.fn(() => true)

    expect(insertCanvasMediaSource({
      context: {
        commitItemsChange,
        createId: (prefix) => `${prefix}-1`,
        selection: ['rect-1'],
      },
      importers: [{
        id: 'plain-url',
        createItems: ({ createId, position, source }) => [{
          h: 42,
          id: createId('text'),
          text: source.url,
          type: 'text',
          w: 240,
          x: position.x,
          y: position.y,
        } as const],
      }],
      position: { x: 200, y: 140 },
      source: { url: 'https://example.com/docs' },
      viewport: { scale: 1, x: 0, y: 0 },
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'text-1',
            text: 'https://example.com/docs',
            x: 200,
            y: 140,
          }),
        ],
        type: 'add',
      },
      {
        after: ['text-1'],
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

    expect(getCanvasMediaInsertPosition({
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 200, y: 120 })
    expect(getCanvasMediaInsertPosition({
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 100, y: 120 })
  })
})
