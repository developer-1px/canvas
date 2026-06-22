import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  CANVAS_BOARD_EXPORT_KIND,
  CANVAS_BOARD_EXPORT_VERSION,
  CANVAS_BOARD_IO_PLUGIN_ID,
  CANVAS_BOARD_JSON_MIME_TYPE,
  CANVAS_BOARD_SVG_MIME_TYPE,
  createCanvasBoardExportPayload,
  createCanvasBoardIoPlugin,
  createCanvasBoardJsonExportFile,
  createCanvasBoardSvgExport,
  createCanvasBoardSvgExportFile,
  parseCanvasBoardExportPayload,
  stringifyCanvasBoardExportPayload,
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
} from './CanvasBoardIoPlugin'

export const CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'import-export',
    contributes: {
      surfaces: ['exporter', 'importer'],
    },
    id: 'board-io',
    label: 'Board IO',
    lifecycle: {
      orphanedDataPolicy: 'preserve',
      orphanedDataScopeIds: ['board-io'],
      partialUpdate: ['exporter', 'importer'],
      runtimeToggleable: true,
    },
    runtimeFeaturePacks: {
      boardIo: true,
    },
  })
