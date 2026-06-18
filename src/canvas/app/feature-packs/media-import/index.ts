import {
  createCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
} from '../CanvasAppFeaturePacks'
import {
  CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
} from './CanvasLinkPreviewInspectorPanel'

export {
  CANVAS_MEDIA_SOURCE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_MEDIA_SOURCE_JSON_MIME_TYPE,
  CANVAS_MEDIA_SOURCE_JSON_TYPES,
  CANVAS_MEDIA_SOURCE_JSON_WRAPPER_KEYS,
  CANVAS_MEDIA_SOURCE_URI_LIST_MIME_TYPE,
  createCanvasMediaImportItems,
  getCanvasMediaInsertPosition,
  getCanvasMediaSourceFromDataTransfer,
  getCanvasMediaSourceFromJSONDataTransfer,
  getCanvasMediaSourceFromText,
  insertCanvasMediaSource,
  routeCanvasMediaSourceObjectHyperlink,
  type CanvasMediaImportResult,
  type CanvasMediaInsertPositionInput,
  type CanvasMediaInsertionContext,
  type CanvasMediaObjectHyperlinkFallbackReason,
  type CanvasMediaObjectHyperlinkFallbackRoute,
  type CanvasMediaObjectHyperlinkRoute,
  type CanvasMediaObjectHyperlinkRouteInput,
  type CanvasMediaObjectHyperlinkRoutedRoute,
  type CanvasMediaObjectHyperlinkTarget,
  type CanvasMediaObjectHyperlinkTargetInput,
  type CanvasMediaObjectHyperlinkUpdateIntent,
  type CanvasMediaSourceDataTransfer,
} from './CanvasMediaImport'
export {
  assertCanvasMediaImporter,
  assertCanvasMediaImporters,
  type CanvasMediaImporter,
  type CanvasMediaImporterContext,
  type CanvasMediaImportSource,
} from './CanvasMediaImporters'
export {
  CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
  changeCanvasLinkPreviewBackToText,
  changeCanvasLinkPreviewOrientation,
} from './CanvasLinkPreviewInspectorPanel'
export {
  useCanvasLinkPreviewImport,
  type CanvasLinkPreviewImportInput,
} from './useCanvasLinkPreviewImport'

export const CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK = createCanvasAppFeaturePack({
  extensionBundle: createCanvasAppExtensionBundle({
    inspectorPanels: [CANVAS_LINK_PREVIEW_INSPECTOR_PANEL],
  }),
  id: 'media-import',
  label: 'Media import',
})

export const CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    extensionFeaturePack: CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK,
    id: 'media-import',
    label: 'Media import',
  })
