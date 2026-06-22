import type {
  CanvasAppFeaturePackCatalogBlockedReason,
  CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import type {
  CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackMarketplaceListing,
  CanvasAppFeaturePackMarketplaceListingBlockedReason,
} from './CanvasAppFeaturePackMarketplaceListings'
import type {
  CanvasAppFeaturePackMarketplacePackPackageContract,
  CanvasAppFeaturePackMarketplacePackageState,
} from './CanvasAppFeaturePackMarketplacePackages'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackInstallOptions,
  CanvasAppFeaturePackRuntimeStateInput,
  CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackStateTransitionBlockedReason,
  CanvasAppFeaturePackStateTransitionChange,
  CanvasAppFeaturePackStateTransitionOperation,
  CanvasAppFeaturePackStateTransitionPlanStatus,
  CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
} from './CanvasAppFeaturePackStateTransitionPlan'

export type CanvasAppFeaturePackMarketplaceActionKind =
  CanvasAppFeaturePackStateTransitionOperation

export type CanvasAppFeaturePackMarketplaceActionModel = Readonly<{
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
}>

export type CanvasAppFeaturePackMarketplaceActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackMarketplaceAction[]
  catalogItem: CanvasAppFeaturePackCatalogItem
  catalogBlockedReasons: readonly CanvasAppFeaturePackCatalogBlockedReason[]
  enabled: boolean
  featurePackId: CanvasAppFeaturePackId
  installed: boolean
  listing: CanvasAppFeaturePackMarketplaceListing
  packageContract: CanvasAppFeaturePackMarketplacePackPackageContract
  packageState: CanvasAppFeaturePackMarketplacePackageState
  primaryActionKind: CanvasAppFeaturePackMarketplaceActionKind
  status: CanvasAppFeaturePackRuntimeStateStatus
}>

export type CanvasAppFeaturePackMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
}>

export const CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS = Object.freeze([
  'install',
  'enable',
  'disable',
  'uninstall',
] as const satisfies readonly CanvasAppFeaturePackMarketplaceActionKind[])
