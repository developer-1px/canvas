import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestCategory,
  type CanvasAppFeaturePackManifestCompatibility,
  type CanvasAppFeaturePackManifestContributions,
  type CanvasAppFeaturePackManifestInstallOptions,
  type CanvasAppFeaturePackManifestLifecycle,
  type CanvasAppFeaturePackManifestPackage,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStateStatus,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  createCanvasAppFeaturePackCatalogGraph,
  createCanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalogCalculations'

export type CanvasAppFeaturePackCatalog = Readonly<{
  items: readonly CanvasAppFeaturePackCatalogItem[]
}>

export type CanvasAppFeaturePackCatalogItem = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackCatalogBlockedReason[]
  category: CanvasAppFeaturePackManifestCategory
  compatibility: CanvasAppFeaturePackManifestCompatibility
  conflicts: readonly CanvasAppFeaturePackId[]
  contributes: CanvasAppFeaturePackManifestContributions
  enabled: boolean
  id: CanvasAppFeaturePackId
  installed: boolean
  label: string
  lifecycle: CanvasAppFeaturePackManifestLifecycle
  optionalRequires: readonly CanvasAppFeaturePackId[]
  package: CanvasAppFeaturePackManifestPackage
  partialUpdate: readonly CanvasAppFeaturePackContributionSurface[]
  provides: readonly CanvasAppFeaturePackId[]
  requires: readonly CanvasAppFeaturePackId[]
  state: CanvasAppFeaturePackRuntimeState
  status: CanvasAppFeaturePackRuntimeStateStatus
  version: string
}>

export type CanvasAppFeaturePackCatalogBlockScope =
  | 'enabled'
  | 'installed'

export type CanvasAppFeaturePackCatalogRequiredBlockReasonKind =
  | 'disabled-required-pack'
  | 'missing-required-pack'
  | 'uninstalled-required-pack'

export type CanvasAppFeaturePackCatalogConflictBlockReasonKind =
  | 'enabled-conflict'
  | 'installed-conflict'

export type CanvasAppFeaturePackCatalogRequiredBlockReason = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackCatalogRequiredBlockReasonKind
  requiredId: CanvasAppFeaturePackId
  scope: CanvasAppFeaturePackCatalogBlockScope
}>

export type CanvasAppFeaturePackCatalogConflictBlockReason = Readonly<{
  conflictId: CanvasAppFeaturePackId
  featurePackId: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackCatalogConflictBlockReasonKind
  scope: CanvasAppFeaturePackCatalogBlockScope
}>

export type CanvasAppFeaturePackCatalogBlockedReason =
  | CanvasAppFeaturePackCatalogConflictBlockReason
  | CanvasAppFeaturePackCatalogRequiredBlockReason

export function getCanvasAppFeaturePackCatalog(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): CanvasAppFeaturePackCatalog {
  assertCanvasAppFeaturePackManifests(manifests)

  const states = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    options,
  )
  const graph = createCanvasAppFeaturePackCatalogGraph({
    manifests,
    states,
  })

  return Object.freeze({
    items: Object.freeze(
      manifests.map((manifest) =>
        createCanvasAppFeaturePackCatalogItem({
          graph,
          manifest,
        }),
      ),
    ),
  })
}
