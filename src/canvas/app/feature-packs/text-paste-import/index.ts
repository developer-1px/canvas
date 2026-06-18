import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  createCanvasPlainTextPasteSource,
  createCanvasTextPasteItems,
  getCanvasRichTextPasteSourceFromDataTransfer,
  getCanvasRichTextPasteSourceFromHTML,
  getCanvasTextPasteInsertPosition,
  getCanvasTextPasteSourceCandidatesFromDataTransfer,
  getCanvasTextPasteSourceText,
  getCanvasTextPasteSourcesFromDataTransfer,
  insertCanvasTextPasteSource,
  routeCanvasTextPasteReplace,
  type CanvasPlainTextPasteSource,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
  type CanvasRichTextPasteSource,
  type CanvasTextPasteImportResult,
  type CanvasTextPasteInsertPositionInput,
  type CanvasTextPasteInsertionContext,
  type CanvasTextPasteReplaceFallbackReason,
  type CanvasTextPasteReplaceFallbackRoute,
  type CanvasTextPasteReplaceIntent,
  type CanvasTextPasteReplaceRoute,
  type CanvasTextPasteReplaceRouteInput,
  type CanvasTextPasteReplaceRoutedRoute,
  type CanvasTextPasteReplaceTarget,
  type CanvasTextPasteReplaceTargetInput,
  type CanvasTextPasteSource,
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
