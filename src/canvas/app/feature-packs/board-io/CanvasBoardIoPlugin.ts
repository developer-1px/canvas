import {
  CANVAS_BOARD_IO_PLUGIN_ID,
  CANVAS_BOARD_JSON_MIME_TYPE,
  CANVAS_BOARD_SVG_MIME_TYPE,
  DEFAULT_BOARD_JSON_FILENAME,
  type CanvasBoardIoPlugin,
  type CanvasBoardIoPluginOptions,
} from './CanvasBoardIoContracts'
import {
  createCanvasBoardJsonExportFile,
  createCanvasBoardSvgExportFile,
} from './CanvasBoardExportFiles'
import {
  createCanvasBoardExportPayload,
  parseCanvasBoardExportPayload,
} from './CanvasBoardJsonPayload'
import {
  createCanvasBoardSvgExport,
} from './CanvasBoardSvgExport'

export {
  CANVAS_BOARD_EXPORT_KIND,
  CANVAS_BOARD_EXPORT_VERSION,
  CANVAS_BOARD_IO_PLUGIN_ID,
  CANVAS_BOARD_JSON_MIME_TYPE,
  CANVAS_BOARD_SVG_MIME_TYPE,
  type CanvasBoardExportInput,
  type CanvasBoardExportMetadata,
  type CanvasBoardExportPayload,
  type CanvasBoardIoFileNameAdapter,
  type CanvasBoardIoMimeTypes,
  type CanvasBoardIoPlugin,
  type CanvasBoardIoPluginOptions,
  type CanvasBoardIoStorageAdapter,
  type CanvasBoardIoTextFile,
  type CanvasBoardSelectionPolicy,
  type CanvasBoardSvgExportFileNameContext,
  type CanvasBoardSvgExportInput,
  type CanvasBoardSvgExportScope,
} from './CanvasBoardIoContracts'
export {
  createCanvasBoardJsonExportFile,
  createCanvasBoardSvgExportFile,
} from './CanvasBoardExportFiles'
export {
  createCanvasBoardExportPayload,
  parseCanvasBoardExportPayload,
  stringifyCanvasBoardExportPayload,
} from './CanvasBoardJsonPayload'
export {
  createCanvasBoardSvgExport,
} from './CanvasBoardSvgExport'

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
