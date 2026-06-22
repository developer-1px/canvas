import type {
  CanvasItem,
  Viewport,
} from '../../../entities'
import type {
  CanvasItemValidationOptions,
} from '../../../host'
import type {
  CanvasImageExportPayload,
} from '../image-io'

export const CANVAS_BOARD_IO_PLUGIN_ID = 'canvas-board-io'
export const CANVAS_BOARD_EXPORT_KIND = 'interactive-os.canvas.board'
export const CANVAS_BOARD_EXPORT_VERSION = 1
export const CANVAS_BOARD_JSON_MIME_TYPE =
  'application/vnd.interactive-os.canvas.board+json'
export const CANVAS_BOARD_SVG_MIME_TYPE = 'image/svg+xml'

export const DEFAULT_BOARD_JSON_FILENAME = 'canvas-board.canvas.json'
export const DEFAULT_BOARD_SVG_FILENAME = 'canvas-board.svg'
export const DEFAULT_SELECTION_SVG_FILENAME = 'canvas-selection.svg'

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
    file: CanvasBoardIoTextFile<
      CanvasBoardExportPayload | CanvasImageExportPayload
    >,
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
