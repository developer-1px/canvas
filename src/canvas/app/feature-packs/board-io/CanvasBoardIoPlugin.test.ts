import { describe, expect, it } from 'vitest'
import type {
  CanvasItem,
  Viewport,
} from '../../../entities'
import {
  CANVAS_BOARD_EXPORT_KIND,
  CANVAS_BOARD_JSON_MIME_TYPE,
  CANVAS_BOARD_SVG_MIME_TYPE,
  createCanvasBoardExportPayload,
  createCanvasBoardIoPlugin,
  createCanvasBoardSvgExport,
  parseCanvasBoardExportPayload,
  stringifyCanvasBoardExportPayload,
  type CanvasBoardIoTextFile,
} from './CanvasBoardIoPlugin'

const viewport: Viewport = {
  scale: 1,
  x: 12,
  y: 24,
}

describe('CanvasBoardIoPlugin', () => {
  it('round-trips board JSON with version, viewport, selection policy, and metadata', () => {
    const payload = createCanvasBoardExportPayload({
      items: [rectItem],
      selection: ['rect-1'],
      viewport,
    })

    expect(payload).toMatchObject({
      items: [rectItem],
      kind: CANVAS_BOARD_EXPORT_KIND,
      metadata: {
        itemCount: 1,
        selectedItemCount: 1,
      },
      selection: ['rect-1'],
      selectionPolicy: 'preserve',
      version: 1,
      viewport,
    })

    expect(
      parseCanvasBoardExportPayload(stringifyCanvasBoardExportPayload(payload)),
    ).toEqual(payload)
  })

  it('rejects invalid JSON imports without mutating the current document', () => {
    const currentItems = [rectItem]
    const invalidPayload = {
      ...createCanvasBoardExportPayload({
        items: [rectItem],
        selection: ['rect-1'],
        viewport,
      }),
      items: [
        {
          ...rectItem,
          w: Number.NaN,
        },
      ],
    }

    expect(
      parseCanvasBoardExportPayload(JSON.stringify(invalidPayload)),
    ).toBeNull()
    expect(currentItems).toEqual([rectItem])
  })

  it('exports and imports an empty board', () => {
    const payload = createCanvasBoardExportPayload({
      items: [],
      selection: ['missing'],
      viewport,
    })
    const svg = createCanvasBoardSvgExport({
      items: [],
      scope: 'board',
    })

    expect(payload).toMatchObject({
      items: [],
      metadata: {
        itemCount: 0,
        selectedItemCount: 0,
      },
      selection: [],
    })
    expect(parseCanvasBoardExportPayload(JSON.stringify(payload))).toEqual(
      payload,
    )
    expect(svg?.filename).toBe('canvas-board.svg')
    expect(svg?.svg).toContain('<svg')
  })

  it('exports whole-board SVG independently from selected-region SVG', () => {
    const items = [
      rectItem,
      {
        ...rectItem,
        fill: '#ef4444',
        id: 'rect-2',
        x: 300,
      },
    ] satisfies CanvasItem[]
    const boardSvg = createCanvasBoardSvgExport({
      items,
      scope: 'board',
      selection: ['rect-1'],
    })
    const selectionSvg = createCanvasBoardSvgExport({
      items,
      scope: 'selection',
      selection: ['rect-1'],
    })

    expect(boardSvg?.filename).toBe('canvas-board.svg')
    expect(selectionSvg?.filename).toBe('canvas-selection.svg')
    expect(boardSvg?.width).toBe(448)
    expect(selectionSvg?.width).toBe(148)
    expect(boardSvg?.svg).toContain('#ef4444')
    expect(selectionSvg?.svg).not.toContain('#ef4444')
  })

  it('uses fallback SVG rendering for custom items', () => {
    const customItem: CanvasItem = {
      data: { source: 'external' },
      h: 88,
      id: 'custom-1',
      kind: 'embed',
      presentation: 'missing-renderer',
      title: 'Custom embed',
      type: 'custom',
      w: 180,
      x: 10,
      y: 20,
    }
    const svg = createCanvasBoardSvgExport({
      items: [customItem],
      scope: 'board',
    })

    expect(svg?.svg).toContain('Custom embed')
    expect(svg?.svg).toContain('fill="#f8fafc"')
  })

  it('lets the host own file names, MIME types, and text storage', async () => {
    const writes: CanvasBoardIoTextFile[] = []
    const plugin = createCanvasBoardIoPlugin({
      fileNames: {
        createJsonFileName: () => 'host-board.json',
        createSvgFileName: ({ scope }) => `host-${scope}.svg`,
      },
      mimeTypes: {
        json: 'application/x-host-board+json',
        svg: 'image/x-host-svg',
      },
      storage: {
        readText: () =>
          stringifyCanvasBoardExportPayload(
            createCanvasBoardExportPayload({
              items: [rectItem],
              selection: ['rect-1'],
              viewport,
            }),
          ),
        writeText: (file) => {
          writes.push(file)
        },
      },
    })

    const jsonFile = await plugin.writeJsonExportFile({
      items: [rectItem],
      selection: ['rect-1'],
      viewport,
    })
    const svgFile = await plugin.writeSvgExportFile({
      items: [rectItem],
      scope: 'board',
    })

    expect(plugin.id).toBe('canvas-board-io')
    expect(plugin.jsonMimeType).toBe('application/x-host-board+json')
    expect(plugin.svgMimeType).toBe('image/x-host-svg')
    expect(jsonFile.filename).toBe('host-board.json')
    expect(jsonFile.mimeType).toBe('application/x-host-board+json')
    expect(svgFile?.filename).toBe('host-board.svg')
    expect(svgFile?.mimeType).toBe('image/x-host-svg')
    expect(writes).toHaveLength(2)
    expect(await plugin.readJsonImport()).toMatchObject({
      items: [rectItem],
      selection: ['rect-1'],
    })
  })

  it('uses first-party MIME defaults', () => {
    const plugin = createCanvasBoardIoPlugin()

    expect(plugin.jsonMimeType).toBe(CANVAS_BOARD_JSON_MIME_TYPE)
    expect(plugin.svgMimeType).toBe(CANVAS_BOARD_SVG_MIME_TYPE)
  })
})

const rectItem = {
  fill: '#ffffff',
  h: 80,
  id: 'rect-1',
  stroke: '#111827',
  type: 'rect',
  w: 100,
  x: 0,
  y: 0,
} satisfies CanvasItem
