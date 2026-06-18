import {
  CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
} from './component-authoring'
import {
  CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
} from './component-library'
import {
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
} from './story-preview'
import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
} from './story-import'
import {
  createCanvasAppFeaturePackSuiteManifest,
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

export const CANVAS_COMPONENT_SYSTEM_SUITE_ID = 'component-system'
export const CANVAS_STORY_CANVAS_SUITE_ID = 'story-canvas'

export const CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST =
  createCanvasAppFeaturePackSuiteManifest({
    featurePackIds: [
      CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
      CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
    ],
    id: CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    label: 'Component system',
  })

export const CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST =
  createCanvasAppFeaturePackSuiteManifest({
    featurePackIds: [
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ],
    id: CANVAS_STORY_CANVAS_SUITE_ID,
    label: 'Story Canvas',
  })

export const DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS = Object.freeze([
  CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST,
]) satisfies readonly CanvasAppFeaturePackSuiteManifest[]
