import type {
  CanvasAppFeaturePackContributionSurface,
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  CanvasAppFeaturePackManifestOrphanedDataPolicy,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackMarketplaceListingBlockedReason,
} from './CanvasAppFeaturePackMarketplaceListings'
import type {
  CanvasAppFeaturePackMarketplacePackageState,
  CanvasAppFeaturePackMarketplaceProfilePackageContract,
} from './CanvasAppFeaturePackMarketplacePackages'
import type {
  CanvasAppFeaturePackPartialUpdatePlanBlockedReason,
} from './CanvasAppFeaturePackPartialUpdatePlan'
import type {
  CanvasAppFeaturePackProfile,
  CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackInstallOptions,
  CanvasAppFeaturePackRuntimeState,
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackProfileMarketplaceActionKind = 'apply'

export type CanvasAppFeaturePackProfileMarketplaceStatus =
  | 'active'
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackProfileMarketplaceActionModel = Readonly<{
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
}>

export type CanvasAppFeaturePackProfileMarketplaceActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackProfileMarketplaceAction[]
  active: boolean
  currentEnabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  currentInstalledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  label: string
  missingFeaturePackIds: readonly CanvasAppFeaturePackId[]
  packageContract: CanvasAppFeaturePackMarketplaceProfilePackageContract
  packageState: CanvasAppFeaturePackMarketplacePackageState
  primaryActionKind: CanvasAppFeaturePackProfileMarketplaceActionKind
  profile: CanvasAppFeaturePackProfile
  profileId: CanvasAppFeaturePackProfileId
  status: CanvasAppFeaturePackProfileMarketplaceStatus
  targetEnabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  targetInstalledFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackProfileMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackProfileMarketplaceBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackProfileMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
  status: CanvasAppFeaturePackProfileMarketplaceStatus
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry[]
}>

export type CanvasAppFeaturePackProfileMarketplaceStateChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
}>

export type CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    orphanedDataScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    orphanedDataPolicy: CanvasAppFeaturePackManifestOrphanedDataPolicy
  }>

export type CanvasAppFeaturePackProfileMarketplaceBlockScope =
  | 'enabled'
  | 'installed'

export type CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind =
  | 'disabled-required-pack'
  | 'missing-required-pack'
  | 'uninstalled-required-pack'

export type CanvasAppFeaturePackProfileMarketplaceConflictReasonKind =
  | 'enabled-conflict'
  | 'installed-conflict'

export type CanvasAppFeaturePackProfileMarketplaceUnknownPackReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'unknown-profile-pack'
    profileId: CanvasAppFeaturePackProfileId
  }>

export type CanvasAppFeaturePackProfileMarketplaceLifecycleReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind:
      | 'install-unavailable'
      | 'runtime-toggle-unavailable'
      | 'uninstall-unavailable'
    profileId: CanvasAppFeaturePackProfileId
  }>

export type CanvasAppFeaturePackProfileMarketplacePartialUpdateReason =
  Readonly<{
    kind: 'partial-update-blocked'
    profileId: CanvasAppFeaturePackProfileId
    reason: CanvasAppFeaturePackPartialUpdatePlanBlockedReason
  }>

export type CanvasAppFeaturePackProfileMarketplaceRequiredReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind
    profileId: CanvasAppFeaturePackProfileId
    requiredId: CanvasAppFeaturePackId
    scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
  }>

export type CanvasAppFeaturePackProfileMarketplaceConflictReason =
  Readonly<{
    conflictId: CanvasAppFeaturePackId
    featurePackId: CanvasAppFeaturePackId
    kind: CanvasAppFeaturePackProfileMarketplaceConflictReasonKind
    profileId: CanvasAppFeaturePackProfileId
    scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
  }>

export type CanvasAppFeaturePackProfileMarketplaceBlockedReason =
  | CanvasAppFeaturePackProfileMarketplaceConflictReason
  | CanvasAppFeaturePackProfileMarketplaceLifecycleReason
  | CanvasAppFeaturePackProfileMarketplacePartialUpdateReason
  | CanvasAppFeaturePackProfileMarketplaceRequiredReason
  | CanvasAppFeaturePackProfileMarketplaceUnknownPackReason

export type CanvasAppFeaturePackProfileMarketplaceContext = Readonly<{
  currentStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
  profile: CanvasAppFeaturePackProfile
  targetStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  targetStates: readonly CanvasAppFeaturePackRuntimeState[]
}>

export type CanvasAppFeaturePackProfileMarketplaceActiveIdSets = Readonly<{
  enabledIds: ReadonlySet<CanvasAppFeaturePackId>
  installedIds: ReadonlySet<CanvasAppFeaturePackId>
  knownIds: ReadonlySet<CanvasAppFeaturePackId>
}>
