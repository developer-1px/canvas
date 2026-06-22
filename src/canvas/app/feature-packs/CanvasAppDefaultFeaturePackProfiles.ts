import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  CANVAS_AUTHORING_BASICS_SUITE_ID,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  CANVAS_IMPORT_EXPORT_SUITE_ID,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  CANVAS_STORY_CANVAS_SUITE_ID,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppInstalledFeaturePackManifestIds,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackSuiteFeaturePackIds,
} from './CanvasAppFeaturePackSuites'
import {
  createCanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfileFactory'
import type {
  CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfileContracts'

export const CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'core-only',
    label: 'Core only',
  })

export const CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    enabledFeaturePackIds: ['zoom-controls'],
    id: 'minimal-viewer',
    installedFeaturePackIds: ['zoom-controls'],
    label: 'Minimal viewer',
  })

export const CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'story-viewer',
    installedFeaturePackIds: ['zoom-controls'],
    installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
    label: 'Story viewer',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'basic-editor',
    installedFeaturePackIds: ['zoom-controls'],
    installedSuiteIds: [CANVAS_AUTHORING_BASICS_SUITE_ID],
    label: 'Basic editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'component-editor',
    installedFeaturePackIds: ['zoom-controls'],
    installedSuiteIds: [
      CANVAS_AUTHORING_BASICS_SUITE_ID,
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    ],
    label: 'Component editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

const DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS = Object.freeze([
  CANVAS_AUTHORING_BASICS_SUITE_ID,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  CANVAS_IMPORT_EXPORT_SUITE_ID,
])

const DEFAULT_CANVAS_APP_EDITOR_SUITE_FEATURE_PACK_IDS = new Set(
  getCanvasAppFeaturePackSuiteFeaturePackIds(
    DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
    DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
  ),
)

const DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS =
  Object.freeze(DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS.filter(
    (manifest) =>
      !DEFAULT_CANVAS_APP_EDITOR_SUITE_FEATURE_PACK_IDS.has(manifest.id),
  ))

export const DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS,
    ),
    enabledSuiteIds: DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
    id: 'editor',
    installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS,
    ),
    installedSuiteIds: DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
    label: 'Editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES = Object.freeze([
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
  CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
  DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE,
]) satisfies readonly CanvasAppFeaturePackProfile[]
