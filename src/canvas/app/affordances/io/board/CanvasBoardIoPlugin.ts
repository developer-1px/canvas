import type {
  Bounds,
  CanvasItem,
  Viewport,
} from '../../../../entities'
import {
  getCanvasItemsBounds,
  getCanvasValidSelection,
  type CanvasItemValidationOptions,
} from '../../../../host'
import {
  CANVAS_WORKSPACE_VERSION,
  createCanvasWorkspaceSnapshot,
  parseCanvasWorkspaceSnapshot,
} from '../../../workspace/document/CanvasWorkspaceSnapshot'
import {
  createCanvasItemsImageExport,
  type CanvasImageExportPayload,
} from '../image/CanvasImageExportSvg'

export const CANVAS_BOARD_IO_PLUGIN_ID = 'canvas-board-io'
export const CANVAS_BOARD_EXPORT_KIND = 'interactive-os.canvas.board'
export const CANVAS_BOARD_EXPORT_VERSION = 1
export const CANVAS_BOARD_JSON_MIME_TYPE =
  'application/vnd.interactive-os.canvas.board+json'
export const CANVAS_BOARD_SVG_MIME_TYPE = 'image/svg+xml'

export type CanvasBoardSelectionPolicy = 'preserve'

export type CanvasBoardExportMetadata = {
  itemCount: number
  selectedItemCount: number
}

export type CanvasBoardExportPayload = {
  items: CanvasItem[]
  kind: typeof CANVAS_BOARD_EXPORT_KIND
  metadata: CanvasBoardExportMetadata
  selection: string[]
  selectionPolicy: CanvasBoardSelectionPolicy
  version: typeof CANVAS_BOARD_EXPORT_VERSION
  viewport: Viewport
}

export type CanvasBoardExportInput = {
  items: CanvasItem[]
  selection: string[]
  validation?: CanvasItemValidationOptions
  viewport: Viewport
}

export type CanvasBoardSvgExportScope = 'board' | 'selection'

export type CanvasBoardSvgExportInput = {
  filename?: string
  items: CanvasItem[]
  scope?: CanvasBoardSvgExportScope
  selection?: string[]
}

export type CanvasBoardIoTextFile<TPayload = unknown> = {
  filename: string
  mimeType: string
  payload: TPayload
  text: string
}

export type CanvasBoardIoFileNameAdapter = {
  createJsonFileName?: (payload: CanvasBoardExportPayload) => string
  createSvgFileName?: (context: CanvasBoardSvgExportFileNameContext) => string
}

export type CanvasBoardSvgExportFileNameContext = {
  itemCount: number
  scope: CanvasBoardSvgExportScope
  selectedItemCount: number
}

export type CanvasBoardIoMimeTypes = {
  json?: string
  svg?: string
}

export type CanvasBoardIoStorageAdapter = {
  readText?: () => Promise<string | null> | string | null
  writeText?: (
    file: CanvasBoardIoTextFile<CanvasBoardExportPayload | CanvasImageExportPayload>,
  ) => Promise<void> | void
}

export type CanvasBoardIoPluginOptions = {
  fileNames?: CanvasBoardIoFileNameAdapter
  mimeTypes?: CanvasBoardIoMimeTypes
  storage?: CanvasBoardIoStorageAdapter
}

export type CanvasBoardIoPlugin = {
  createJsonExportFile: (
    input: CanvasBoardExportInput,
  ) => CanvasBoardIoTextFile<CanvasBoardExportPayload>
  createSvgExportFile: (
    input: CanvasBoardSvgExportInput,
  ) => CanvasBoardIoTextFile<CanvasImageExportPayload> | null
  id: typeof CANVAS_BOARD_IO_PLUGIN_ID
  jsonMimeType: string
  parseJsonImport: (
    value: string | null,
    validation?: CanvasItemValidationOptions,
  ) => CanvasBoardExportPayload | null
  readJsonImport: (
    validation?: CanvasItemValidationOptions,
  ) => Promise<CanvasBoardExportPayload | null>
  svgMimeType: string
  writeJsonExportFile: (
    input: CanvasBoardExportInput,
  ) => Promise<CanvasBoardIoTextFile<CanvasBoardExportPayload>>
  writeSvgExportFile: (
    input: CanvasBoardSvgExportInput,
  ) => Promise<CanvasBoardIoTextFile<CanvasImageExportPayload> | null>
}

const EMPTY_BOARD_BOUNDS: Bounds = {
  h: 0,
  w: 0,
  x: 0,
  y: 0,
}

const DEFAULT_BOARD_JSON_FILENAME = 'canvas-board.canvas.json'
const DEFAULT_BOARD_SVG_FILENAME = 'canvas-board.svg'
const DEFAULT_SELECTION_SVG_FILENAME = 'canvas-selection.svg'

export function createCanvasBoardExportPayload({
  items,
  selection,
  validation,
  viewport,
}: CanvasBoardExportInput): CanvasBoardExportPayload {
  const snapshot = createCanvasWorkspaceSnapshot({
    items,
    selection,
    validation,
    viewport,
  })

  return {
    items: snapshot.items,
    kind: CANVAS_BOARD_EXPORT_KIND,
    metadata: {
      itemCount: snapshot.items.length,
      selectedItemCount: snapshot.selection.length,
    },
    selection: snapshot.selection,
    selectionPolicy: 'preserve',
    version: CANVAS_BOARD_EXPORT_VERSION,
    viewport: snapshot.viewport,
  }
}

export function stringifyCanvasBoardExportPayload(
  payload: CanvasBoardExportPayload,
) {
  return JSON.stringify(payload, null, 2)
}

export function parseCanvasBoardExportPayload(
  value: string | null,
  validation: CanvasItemValidationOptions = {},
): CanvasBoardExportPayload | null {
  if (!value) {
    return null
  }

  try {
    return normalizeCanvasBoardExportPayload(JSON.parse(value), validation)
  } catch {
    return null
  }
}

export function createCanvasBoardSvgExport({
  filename,
  items,
  scope = 'board',
  selection = [],
}: CanvasBoardSvgExportInput): CanvasImageExportPayload | null {
  const targetItems =
    scope === 'selection'
      ? getSelectedCanvasBoardItems(items, selection)
      : items

  if (scope === 'selection' && targetItems.length === 0) {
    return null
  }

  const bounds = getCanvasItemsBounds(targetItems) ?? EMPTY_BOARD_BOUNDS
  const exportPayload = createCanvasItemsImageExport({
    bounds,
    items: targetItems,
  })

  return {
    ...exportPayload,
    filename:
      filename ??
      (scope === 'selection'
        ? DEFAULT_SELECTION_SVG_FILENAME
        : DEFAULT_BOARD_SVG_FILENAME),
  }
}

export function createCanvasBoardJsonExportFile({
  filename = DEFAULT_BOARD_JSON_FILENAME,
  mimeType = CANVAS_BOARD_JSON_MIME_TYPE,
  payload,
}: {
  filename?: string
  mimeType?: string
  payload: CanvasBoardExportPayload
}): CanvasBoardIoTextFile<CanvasBoardExportPayload> {
  return {
    filename,
    mimeType,
    payload,
    text: stringifyCanvasBoardExportPayload(payload),
  }
}

export function createCanvasBoardSvgExportFile({
  mimeType = CANVAS_BOARD_SVG_MIME_TYPE,
  payload,
}: {
  mimeType?: string
  payload: CanvasImageExportPayload
}): CanvasBoardIoTextFile<CanvasImageExportPayload> {
  return {
    filename: payload.filename,
    mimeType,
    payload,
    text: payload.svg,
  }
}

export function createCanvasBoardIoPlugin({
  fileNames = {},
  mimeTypes = {},
  storage = {},
}: CanvasBoardIoPluginOptions = {}): CanvasBoardIoPlugin {
  const jsonMimeType = mimeTypes.json ?? CANVAS_BOARD_JSON_MIME_TYPE
  const svgMimeType = mimeTypes.svg ?? CANVAS_BOARD_SVG_MIME_TYPE

  const plugin: CanvasBoardIoPlugin = {
    createJsonExportFile: (input) => {
      const payload = createCanvasBoardExportPayload(input)

      return createCanvasBoardJsonExportFile({
        filename:
          fileNames.createJsonFileName?.(payload) ??
          DEFAULT_BOARD_JSON_FILENAME,
        mimeType: jsonMimeType,
        payload,
      })
    },
    createSvgExportFile: (input) => {
      const payload = createCanvasBoardSvgExport({
        ...input,
        filename:
          input.filename ??
          fileNames.createSvgFileName?.({
            itemCount: input.items.length,
            scope: input.scope ?? 'board',
            selectedItemCount: input.selection?.length ?? 0,
          }),
      })

      return payload
        ? createCanvasBoardSvgExportFile({
            mimeType: svgMimeType,
            payload,
          })
        : null
    },
    id: CANVAS_BOARD_IO_PLUGIN_ID,
    jsonMimeType,
    parseJsonImport: parseCanvasBoardExportPayload,
    readJsonImport: async (validation) => {
      const value = await storage.readText?.()

      return parseCanvasBoardExportPayload(value ?? null, validation)
    },
    svgMimeType,
    writeJsonExportFile: async (input) => {
      const file = plugin.createJsonExportFile(input)
      await storage.writeText?.(file)

      return file
    },
    writeSvgExportFile: async (input) => {
      const file = plugin.createSvgExportFile(input)

      if (file) {
        await storage.writeText?.(file)
      }

      return file
    },
  }

  return Object.freeze(plugin)
}

function normalizeCanvasBoardExportPayload(
  value: unknown,
  validation: CanvasItemValidationOptions,
): CanvasBoardExportPayload | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.kind !== CANVAS_BOARD_EXPORT_KIND ||
    value.version !== CANVAS_BOARD_EXPORT_VERSION ||
    value.selectionPolicy !== 'preserve'
  ) {
    return null
  }

  const snapshot = parseCanvasWorkspaceSnapshot(
    JSON.stringify({
      items: value.items,
      selection: value.selection,
      version: CANVAS_WORKSPACE_VERSION,
      viewport: value.viewport,
    }),
    validation,
  )

  if (!snapshot) {
    return null
  }

  return createCanvasBoardExportPayload({
    items: snapshot.items,
    selection: snapshot.selection,
    validation,
    viewport: snapshot.viewport,
  })
}

function getSelectedCanvasBoardItems(
  items: CanvasItem[],
  selection: string[],
) {
  const selected = new Set(getCanvasValidSelection(items, selection))

  return collectSelectedCanvasBoardItems(items, selected)
}

function collectSelectedCanvasBoardItems(
  items: CanvasItem[],
  selected: Set<string>,
): CanvasItem[] {
  return items.flatMap((item) => {
    if (selected.has(item.id)) {
      return [item]
    }

    if (item.type === 'group') {
      return collectSelectedCanvasBoardItems(item.children, selected)
    }

    return []
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
