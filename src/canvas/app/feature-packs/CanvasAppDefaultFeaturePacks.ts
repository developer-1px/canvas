import {
  CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './arrow-routing-inspector'
import {
  CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './checklist-inspector'
import {
  CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './kanban-inspector'
import {
  CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK_MANIFEST,
} from './media-import'
import {
  createCanvasAppFeaturePackExtensionBundle,
  type CanvasAppFeaturePack,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppManifestExtensionFeaturePacks,
  type CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

export {
  CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK,
  CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './arrow-routing-inspector'
export {
  CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK,
  CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './checklist-inspector'
export {
  CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK,
  CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './kanban-inspector'
export {
  CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK,
  CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK_MANIFEST,
} from './media-import'

export const DEFAULT_CANVAS_APP_EXTENSION_FEATURE_PACK_MANIFESTS =
  Object.freeze([
    CANVAS_APP_MEDIA_IMPORT_FEATURE_PACK_MANIFEST,
    CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK_MANIFEST,
    CANVAS_APP_CHECKLIST_INSPECTOR_FEATURE_PACK_MANIFEST,
    CANVAS_APP_KANBAN_INSPECTOR_FEATURE_PACK_MANIFEST,
  ]) satisfies readonly CanvasAppFeaturePackManifest[]

export const DEFAULT_CANVAS_APP_FEATURE_PACKS =
  getCanvasAppManifestExtensionFeaturePacks(
    DEFAULT_CANVAS_APP_EXTENSION_FEATURE_PACK_MANIFESTS,
  ) satisfies readonly CanvasAppFeaturePack[]

export const DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE =
  createCanvasAppFeaturePackExtensionBundle(DEFAULT_CANVAS_APP_FEATURE_PACKS)
