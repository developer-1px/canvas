import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  getCanvasTableCsvFileFromDataTransfer,
  getCanvasTableCsvFileFromList,
  getCanvasTableCsvSourceFromDataTransfer,
  getCanvasTableCsvSourceFromText,
  getCanvasTableInsertCenter,
  insertCanvasTableSource,
  readCanvasTableCsvFileSource,
  type CanvasTableImportSource,
  type CanvasTableInsertCenterInput,
  type CanvasTableInsertionContext,
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
