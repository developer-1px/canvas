import type {
  CanvasAppFeaturePack,
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackInstallOptions,
} from './CanvasAppFeaturePacks'
import type { CanvasAppViewFeaturePack } from './CanvasAppFeaturePackViews'

export type CanvasAppFeaturePackManifest<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    category: CanvasAppFeaturePackManifestCategory
    compatibility: CanvasAppFeaturePackManifestCompatibility
    conflicts: readonly CanvasAppFeaturePackId[]
    contributes: CanvasAppFeaturePackManifestContributions
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    lifecycle: CanvasAppFeaturePackManifestLifecycle
    optionalRequires: readonly CanvasAppFeaturePackId[]
    package: CanvasAppFeaturePackManifestPackage
    provides: readonly CanvasAppFeaturePackId[]
    requires: readonly CanvasAppFeaturePackId[]
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    version: string
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    category?: CanvasAppFeaturePackManifestCategory
    compatibility?: CanvasAppFeaturePackManifestCompatibilityInput
    conflicts?: readonly CanvasAppFeaturePackId[]
    contributes?: CanvasAppFeaturePackManifestContributionsInput
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    lifecycle?: CanvasAppFeaturePackManifestLifecycleInput
    optionalRequires?: readonly CanvasAppFeaturePackId[]
    package?: CanvasAppFeaturePackManifestPackageInput
    provides?: readonly CanvasAppFeaturePackId[]
    requires?: readonly CanvasAppFeaturePackId[]
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    version?: string
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInstallOptions =
  CanvasAppFeaturePackInstallOptions

export type CanvasAppFeaturePackManifestCategory =
  | 'automation'
  | 'authoring'
  | 'collaboration'
  | 'foundation'
  | 'import-export'
  | 'inspection'
  | 'review'
  | 'suite'
  | 'view'

export type CanvasAppFeaturePackContributionSurface =
  | 'asset'
  | 'command'
  | 'document-change'
  | 'documentation'
  | 'exporter'
  | 'importer'
  | 'inspector'
  | 'item-renderer'
  | 'item-schema'
  | 'migration'
  | 'overlay'
  | 'runtime-model'
  | 'tool'
  | 'view-renderer'

export type CanvasAppFeaturePackManifestContributions = Readonly<{
  surfaces: readonly CanvasAppFeaturePackContributionSurface[]
}>

export type CanvasAppFeaturePackManifestContributionsInput = Readonly<{
  surfaces?: readonly CanvasAppFeaturePackContributionSurface[]
}>

export type CanvasAppFeaturePackManifestLifecycle = Readonly<{
  hotReloadable: boolean
  installable: boolean
  orphanedDataScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  orphanedDataPolicy: CanvasAppFeaturePackManifestOrphanedDataPolicy
  partialUpdate: readonly CanvasAppFeaturePackContributionSurface[]
  runtimeToggleable: boolean
  uninstallable: boolean
}>

export type CanvasAppFeaturePackManifestLifecycleInput = Readonly<{
  hotReloadable?: boolean
  installable?: boolean
  orphanedDataScopeIds?: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  orphanedDataPolicy?: CanvasAppFeaturePackManifestOrphanedDataPolicy
  partialUpdate?: readonly CanvasAppFeaturePackContributionSurface[]
  runtimeToggleable?: boolean
  uninstallable?: boolean
}>

export type CanvasAppFeaturePackManifestOrphanedDataPolicy =
  | 'host-managed'
  | 'preserve'
  | 'remove'

export type CanvasAppFeaturePackManifestOrphanedDataScopeId =
  CanvasAppFeaturePackId

export type CanvasAppFeaturePackManifestCompatibility = Readonly<{
  documentSchemaVersion?: string
  engineVersion: string
  featureStateVersion?: string
}>

export type CanvasAppFeaturePackManifestCompatibilityInput = Readonly<{
  documentSchemaVersion?: string
  engineVersion?: string
  featureStateVersion?: string
}>

export type CanvasAppFeaturePackManifestPackage = Readonly<{
  name: string
  subpath?: string
}>

export type CanvasAppFeaturePackManifestPackageInput = Readonly<{
  name?: string
  subpath?: string
}>
