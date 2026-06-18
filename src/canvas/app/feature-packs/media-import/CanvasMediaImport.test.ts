import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_MEDIA_IMPORT_MODEL,
  CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE,
  createCanvasMediaImportItems,
  getCanvasMediaInsertPosition,
  getCanvasMediaSourceFromDataTransfer,
  getCanvasMediaSourceFromJSONDataTransfer,
  getCanvasMediaSourceFromText,
  insertCanvasMediaSource,
  routeCanvasMediaSourceObjectHyperlink,
} from './CanvasMediaImport'
import type { CanvasMediaImporter } from './CanvasMediaImporters'

describe('CanvasMediaImport', () => {
  it('exposes a stable model metadata value', () => {
    expect(CANVAS_MEDIA_IMPORT_MODEL).toBe('canvas-media-import')
  })

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

  it('reads custom MIME direct media source JSON with title metadata', () => {
    const dataTransfer = createDataTransfer({
      [CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE]: JSON.stringify({
        title: 'Design Brief',
        url: ' https://example.com/brief ',
      }),
      'text/plain': 'https://fallback.example.com',
    })

    expect(getCanvasMediaSourceFromDataTransfer(dataTransfer)).toEqual({
      title: 'Design Brief',
      url: 'https://example.com/brief',
    })
  })

  it('reads wrapped application/json media source payloads', () => {
    expect(getCanvasMediaSourceFromJSONDataTransfer(createDataTransfer({
      'application/json': JSON.stringify({
        mediaSource: {
          href: 'https://example.com/embed',
          name: 'Embed',
        },
      }),
    }))).toEqual({
      title: 'Embed',
      url: 'https://example.com/embed',
    })
    expect(getCanvasMediaSourceFromJSONDataTransfer(createDataTransfer({
      'application/json': JSON.stringify({
        linkPreview: {
          label: 'Preview',
          src: '<iframe src="https://video.example.com/embed"></iframe>',
        },
      }),
    }))).toEqual({
      title: 'Preview',
      url: 'https://video.example.com/embed',
    })
  })

  it('preserves existing URL paste priority before generic JSON media wrappers', () => {
    const dataTransfer = createDataTransfer({
      'application/json': JSON.stringify({
        linkCard: {
          title: 'JSON Link',
          url: 'https://json.example.com',
        },
      }),
      'text/uri-list': 'https://uri-list.example.com',
    })

    expect(getCanvasMediaSourceFromDataTransfer(dataTransfer)).toEqual({
      url: 'https://uri-list.example.com/',
    })
  })

  it('ignores invalid and direct generic media source JSON payloads', () => {
    expect(getCanvasMediaSourceFromJSONDataTransfer(null)).toBeNull()
    expect(getCanvasMediaSourceFromJSONDataTransfer(createDataTransfer({
      'application/json': '{"url":"https://direct.example.com"}',
    }))).toBeNull()
    expect(getCanvasMediaSourceFromJSONDataTransfer(createDataTransfer({
      'application/json': '{"mediaSource":{"url":"not a url"}}',
    }))).toBeNull()
    expect(getCanvasMediaSourceFromJSONDataTransfer(createDataTransfer({
      [CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE]: 'not json',
    }))).toBeNull()
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

  it('routes a media URL source to a host object hyperlink target', () => {
    const getTarget = vi.fn(() => ({
      id: 'shape-1',
      selection: ['shape-1'],
    }))

    const route = routeCanvasMediaSourceObjectHyperlink({
      getTarget,
      selection: ['shape-1'],
      source: { title: 'Docs', url: ' https://example.com/docs ' },
    })

    expect(route).toEqual({
      intent: {
        kind: 'object-hyperlink-update',
        target: {
          id: 'shape-1',
          selection: ['shape-1'],
        },
        url: 'https://example.com/docs',
      },
      kind: 'object-hyperlink',
      source: {
        title: 'Docs',
        url: 'https://example.com/docs',
      },
      status: 'routed',
    })
    expect(Object.isFrozen(route)).toBe(true)
    expect(getTarget).toHaveBeenCalledWith({
      selection: ['shape-1'],
      source: {
        title: 'Docs',
        url: 'https://example.com/docs',
      },
      url: 'https://example.com/docs',
    })
  })

  it('falls back to media insertion when no hyperlink target is available', () => {
    expect(routeCanvasMediaSourceObjectHyperlink({
      getTarget: () => null,
      selection: [],
      source: { url: 'https://example.com/docs' },
    })).toEqual({
      kind: 'media-insert',
      reason: 'no-target',
      source: { url: 'https://example.com/docs' },
      status: 'fallback',
      url: 'https://example.com/docs',
    })
  })

  it('lets hosts control disabled state, URL policy, and selection targets', () => {
    const normalizeUrl = vi.fn((url: string) =>
      url.startsWith('mailto:') ? url : null
    )
    const getTarget = vi.fn(({ selection }) =>
      selection.length === 1
        ? { id: selection[0]!, selection }
        : null
    )

    expect(routeCanvasMediaSourceObjectHyperlink({
      disabled: true,
      getTarget,
      normalizeUrl,
      selection: ['shape-1'],
      source: { url: 'mailto:team@example.com' },
    })).toEqual({
      kind: 'media-insert',
      reason: 'disabled',
      source: { url: 'mailto:team@example.com' },
      status: 'fallback',
    })
    expect(getTarget).not.toHaveBeenCalled()

    expect(routeCanvasMediaSourceObjectHyperlink({
      getTarget,
      normalizeUrl,
      selection: ['shape-1'],
      source: { url: 'https://example.com/docs' },
    })).toEqual({
      kind: 'media-insert',
      reason: 'invalid-url',
      source: { url: 'https://example.com/docs' },
      status: 'fallback',
    })

    expect(routeCanvasMediaSourceObjectHyperlink({
      getTarget,
      normalizeUrl,
      selection: ['shape-1'],
      source: { url: 'mailto:team@example.com' },
    })).toMatchObject({
      intent: {
        kind: 'object-hyperlink-update',
        target: {
          id: 'shape-1',
          selection: ['shape-1'],
        },
        url: 'mailto:team@example.com',
      },
      kind: 'object-hyperlink',
      status: 'routed',
    })

    expect(routeCanvasMediaSourceObjectHyperlink({
      getTarget,
      normalizeUrl,
      selection: ['shape-1', 'shape-2'],
      source: { url: 'mailto:team@example.com' },
    })).toMatchObject({
      kind: 'media-insert',
      reason: 'no-target',
      status: 'fallback',
      url: 'mailto:team@example.com',
    })
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
      event: { clientX: 410, clientY: 260 },
      stageElement: stageElement as never,
      viewport: { scale: Number.NaN, x: 10, y: 20 },
    })).toEqual({ x: 4000, y: 2400 })
    expect(getCanvasMediaInsertPosition({
      stageElement: stageElement as never,
      viewport,
    })).toEqual({ x: 100, y: 120 })
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  } as unknown as DataTransfer
}
