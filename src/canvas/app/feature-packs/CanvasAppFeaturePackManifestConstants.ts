import type {
  CanvasAppFeaturePackContributionSurface,
  CanvasAppFeaturePackManifestCategory,
  CanvasAppFeaturePackManifestOrphanedDataPolicy,
} from './CanvasAppFeaturePackManifestTypes'

export const CANVAS_APP_FEATURE_PACK_DEFAULT_CATEGORY =
  'view' satisfies CanvasAppFeaturePackManifestCategory
export const CANVAS_APP_FEATURE_PACK_DEFAULT_VERSION = '0.1.0'
export const CANVAS_APP_FEATURE_PACK_DEFAULT_ENGINE_VERSION = '0.1.x'
export const CANVAS_APP_FEATURE_PACK_DEFAULT_PACKAGE_NAME =
  '@interactive-os/canvas'

export const CANVAS_APP_FEATURE_PACK_CONTRIBUTION_SURFACES =
  Object.freeze([
    'asset',
    'command',
    'document-change',
    'documentation',
    'exporter',
    'importer',
    'inspector',
    'item-renderer',
    'item-schema',
    'migration',
    'overlay',
    'runtime-model',
    'tool',
    'view-renderer',
  ] as const satisfies readonly CanvasAppFeaturePackContributionSurface[])

export const CANVAS_APP_FEATURE_PACK_CATEGORIES =
  Object.freeze([
    'automation',
    'authoring',
    'collaboration',
    'foundation',
    'import-export',
    'inspection',
    'review',
    'suite',
    'view',
  ] as const satisfies readonly CanvasAppFeaturePackManifestCategory[])

export const CANVAS_APP_FEATURE_PACK_ORPHANED_DATA_POLICIES =
  Object.freeze([
    'host-managed',
    'preserve',
    'remove',
  ] as const satisfies readonly CanvasAppFeaturePackManifestOrphanedDataPolicy[])
