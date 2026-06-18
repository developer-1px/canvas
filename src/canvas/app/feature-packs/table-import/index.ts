import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  CANVAS_TABLE_CSV_MIME_TYPES,
  CANVAS_TABLE_FILE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_TABLE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_TABLE_TSV_MIME_TYPES,
  getCanvasTableFileFromDataTransfer,
  getCanvasTableFileFromList,
  getCanvasTableFilesFromDataTransfer,
  getCanvasTableFilesFromList,
  getCanvasTableCsvFileFromDataTransfer,
  getCanvasTableCsvFileFromList,
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableCsvSourceFromText,
  getCanvasTableColumnCount,
  getCanvasTableComponentSize,
  getCanvasTableInsertCenter,
  getCanvasTableSourceFromDataTransfer,
  getCanvasTableSourceFromHTML,
  getCanvasTableSourceFromText,
  insertCanvasTableSource,
  readCanvasTableCsvFileSource,
  readCanvasTableFileSource,
  readCanvasTableFileSources,
  normalizeCanvasTableRows,
  routeCanvasTableImportTargetReplace,
  type CanvasTableComponentSize,
  type CanvasTableComponentSizeInput,
  type CanvasTableComponentSizeOptions,
  type CanvasTableImportFormat,
  type CanvasTableImportSource,
  type CanvasTableImportTargetReplaceFallbackReason,
  type CanvasTableImportTargetReplaceFallbackRoute,
  type CanvasTableImportTargetReplaceIntent,
  type CanvasTableImportTargetReplaceRoute,
  type CanvasTableImportTargetReplaceRouteInput,
  type CanvasTableImportTargetReplaceRoutedRoute,
  type CanvasTableImportTargetReplaceTarget,
  type CanvasTableImportTargetReplaceTargetInput,
  type CanvasTableInsertCenterInput,
  type CanvasTableInsertionContext,
  type CanvasTableRowsNormalizationOptions,
} from './CanvasTableImport'
export {
  useCanvasTableImport,
  type CanvasTableImportInput,
} from './useCanvasTableImport'

export const CANVAS_APP_TABLE_IMPORT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'table-import',
    label: 'Table import',
    runtimeFeaturePacks: {
      tableImport: true,
    },
  })
