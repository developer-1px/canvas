import type {
  CanvasAppFeaturePackContributionSurface,
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackMarketplaceListingBlockedReason,
  CanvasAppFeaturePackSuiteMarketplaceListing,
  CanvasAppFeaturePackSuiteMarketplaceListingBlockedReason,
} from './CanvasAppFeaturePackMarketplaceListings'
import type {
  CanvasAppFeaturePackMarketplacePackageState,
  CanvasAppFeaturePackMarketplaceSuitePackageContract,
} from './CanvasAppFeaturePackMarketplacePackages'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackInstallOptions,
  CanvasAppFeaturePackRuntimeState,
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackSuiteId,
} from './CanvasAppFeaturePackSuites'
import type {
  CanvasAppFeaturePackStateTransitionBlockedReason,
  CanvasAppFeaturePackStateTransitionChange,
  CanvasAppFeaturePackStateTransitionOperation,
  CanvasAppFeaturePackStateTransitionPlanStatus,
  CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
} from './CanvasAppFeaturePackStateTransitionPlan'

export type CanvasAppFeaturePackSuiteMarketplaceActionKind =
  CanvasAppFeaturePackStateTransitionOperation

export type CanvasAppFeaturePackSuiteMarketplaceStatus =
  | 'disabled'
  | 'enabled'
  | 'partial'
  | 'uninstalled'

export type CanvasAppFeaturePackSuiteMarketplaceActionModel = Readonly<{
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
}>

export type CanvasAppFeaturePackSuiteMarketplaceActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackSuiteMarketplaceAction[]
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackIds: readonly CanvasAppFeaturePackId[]
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  label: string
  listing: CanvasAppFeaturePackSuiteMarketplaceListing
  missingFeaturePackIds: readonly CanvasAppFeaturePackId[]
  packageContract: CanvasAppFeaturePackMarketplaceSuitePackageContract
  packageState: CanvasAppFeaturePackMarketplacePackageState
  primaryActionKind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  status: CanvasAppFeaturePackSuiteMarketplaceStatus
  suiteId: CanvasAppFeaturePackSuiteId
}>

export type CanvasAppFeaturePackSuiteMarketplaceBlockedReason =
  | CanvasAppFeaturePackMarketplaceListingBlockedReason
  | CanvasAppFeaturePackSuiteMarketplaceListingBlockedReason

export type CanvasAppFeaturePackSuiteMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackSuiteMarketplaceBlockedReason[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
}>

export type CanvasAppFeaturePackSuiteMarketplaceMemberState = Readonly<{
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  missingFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackSuiteMarketplaceActionContext = Readonly<{
  listing: CanvasAppFeaturePackSuiteMarketplaceListing
  listingById: ReadonlyMap<CanvasAppFeaturePackId, unknown>
  manifests: readonly CanvasAppFeaturePackManifest[]
  memberState: CanvasAppFeaturePackSuiteMarketplaceMemberState
  options: Readonly<{ featurePackStates?: readonly CanvasAppFeaturePackRuntimeStateInput[] }>
  states: readonly CanvasAppFeaturePackRuntimeState[]
}>

export const CANVAS_APP_FEATURE_PACK_SUITE_MARKETPLACE_ACTION_KINDS =
  Object.freeze([
    'install',
    'enable',
    'disable',
    'uninstall',
  ] as const satisfies readonly CanvasAppFeaturePackSuiteMarketplaceActionKind[])
