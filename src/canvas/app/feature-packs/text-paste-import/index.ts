import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  createCanvasTextPasteItems,
  getCanvasRichTextPasteSourceFromDataTransfer,
  getCanvasRichTextPasteSourceFromHTML,
  getCanvasTextPasteInsertPosition,
  getCanvasTextPasteSourcesFromDataTransfer,
  insertCanvasTextPasteSource,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
  type CanvasRichTextPasteSource,
  type CanvasTextPasteImportResult,
  type CanvasTextPasteInsertPositionInput,
  type CanvasTextPasteInsertionContext,
} from './CanvasTextPasteImport'
export {
  assertCanvasTextPasteImporter,
  assertCanvasTextPasteImporters,
  type CanvasTextPasteImporter,
  type CanvasTextPasteImporterContext,
} from './CanvasTextPasteImporters'
export {
  useCanvasTextPasteImport,
  type CanvasTextPasteImportInput,
} from './useCanvasTextPasteImport'

export const CANVAS_APP_TEXT_PASTE_IMPORT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'text-paste-import',
    label: 'Text paste import',
    runtimeFeaturePacks: {
      textPasteImport: true,
    },
  })
