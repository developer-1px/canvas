import {
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons,
  getCanvasAppFeaturePackMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingBlockedReason,
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStateInput,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
  assertCanvasAppFeaturePackSuiteManifests,
} from './CanvasAppFeaturePackSuites'
import {
  getCanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionBlockedReason,
  type CanvasAppFeaturePackStateTransitionChange,
  type CanvasAppFeaturePackStateTransitionOperation,
  type CanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlanStatus,
  type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
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
  missingFeaturePackIds: readonly CanvasAppFeaturePackId[]
  primaryActionKind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  status: CanvasAppFeaturePackSuiteMarketplaceStatus
  suiteId: CanvasAppFeaturePackSuiteId
}>

export type CanvasAppFeaturePackSuiteMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
}>

const CANVAS_APP_FEATURE_PACK_SUITE_MARKETPLACE_ACTION_KINDS = Object.freeze([
  'install',
  'enable',
  'disable',
  'uninstall',
] as const satisfies readonly CanvasAppFeaturePackSuiteMarketplaceActionKind[])

export function getCanvasAppFeaturePackSuiteMarketplaceActionModel({
  listings = [],
  manifests,
  options = {},
  suiteManifests,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[]
}): CanvasAppFeaturePackSuiteMarketplaceActionModel {
  assertCanvasAppFeaturePackSuiteManifests(suiteManifests)
  const states = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    options,
  )
  const listingById = getCanvasAppFeaturePackMarketplaceListingMap({
    listings,
    manifests,
  })

  return Object.freeze({
    items: Object.freeze(suiteManifests.map((suiteManifest) =>
      getCanvasAppFeaturePackSuiteMarketplaceActionItem({
        listingById,
        manifests,
        options,
        states,
        suiteManifest,
      }),
    )),
  })
}

function getCanvasAppFeaturePackSuiteMarketplaceActionItem({
  listingById,
  manifests,
  options,
  states,
  suiteManifest,
}: {
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
  states: readonly CanvasAppFeaturePackRuntimeState[]
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}): CanvasAppFeaturePackSuiteMarketplaceActionItem {
  const memberState = getCanvasAppFeaturePackSuiteMarketplaceMemberState({
    manifests,
    states,
    suiteManifest,
  })
  const status = getCanvasAppFeaturePackSuiteMarketplaceStatus({
    memberState,
    suiteManifest,
  })

  return Object.freeze({
    actions: Object.freeze(
      CANVAS_APP_FEATURE_PACK_SUITE_MARKETPLACE_ACTION_KINDS.map((kind) =>
        getCanvasAppFeaturePackSuiteMarketplaceAction({
          kind,
          listingById,
          manifests,
          memberState,
          options,
          suiteManifest,
        }),
      ),
    ),
    enabledFeaturePackIds: memberState.enabledFeaturePackIds,
    featurePackIds: suiteManifest.featurePackIds,
    installedFeaturePackIds: memberState.installedFeaturePackIds,
    label: suiteManifest.label,
    missingFeaturePackIds: memberState.missingFeaturePackIds,
    primaryActionKind:
      getCanvasAppFeaturePackSuiteMarketplacePrimaryActionKind(status),
    status,
    suiteId: suiteManifest.id,
  })
}

function getCanvasAppFeaturePackSuiteMarketplaceMemberState({
  manifests,
  states,
  suiteManifest,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  states: readonly CanvasAppFeaturePackRuntimeState[]
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}) {
  const manifestIds = new Set(manifests.map((manifest) => manifest.id))
  const stateById = new Map(states.map((state) => [state.id, state]))
  const installedFeaturePackIds: CanvasAppFeaturePackId[] = []
  const enabledFeaturePackIds: CanvasAppFeaturePackId[] = []
  const missingFeaturePackIds: CanvasAppFeaturePackId[] = []

  for (const featurePackId of suiteManifest.featurePackIds) {
    if (!manifestIds.has(featurePackId)) {
      missingFeaturePackIds.push(featurePackId)
      continue
    }

    const state = stateById.get(featurePackId)

    if (state?.installed) {
      installedFeaturePackIds.push(featurePackId)
    }

    if (state?.enabled) {
      enabledFeaturePackIds.push(featurePackId)
    }
  }

  return Object.freeze({
    enabledFeaturePackIds: Object.freeze(enabledFeaturePackIds),
    installedFeaturePackIds: Object.freeze(installedFeaturePackIds),
    missingFeaturePackIds: Object.freeze(missingFeaturePackIds),
  })
}

function getCanvasAppFeaturePackSuiteMarketplaceStatus({
  memberState,
  suiteManifest,
}: {
  memberState: ReturnType<typeof getCanvasAppFeaturePackSuiteMarketplaceMemberState>
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}): CanvasAppFeaturePackSuiteMarketplaceStatus {
  if (
    memberState.enabledFeaturePackIds.length === suiteManifest.featurePackIds.length
  ) {
    return 'enabled'
  }

  if (
    memberState.installedFeaturePackIds.length === suiteManifest.featurePackIds.length &&
    memberState.enabledFeaturePackIds.length === 0
  ) {
    return 'disabled'
  }

  if (
    memberState.installedFeaturePackIds.length === 0 &&
    memberState.enabledFeaturePackIds.length === 0
  ) {
    return 'uninstalled'
  }

  return 'partial'
}

function getCanvasAppFeaturePackSuiteMarketplaceAction({
  kind,
  listingById,
  manifests,
  memberState,
  options,
  suiteManifest,
}: {
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  manifests: readonly CanvasAppFeaturePackManifest[]
  memberState: ReturnType<typeof getCanvasAppFeaturePackSuiteMarketplaceMemberState>
  options: CanvasAppFeaturePackManifestInstallOptions
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}): CanvasAppFeaturePackSuiteMarketplaceAction {
  const transitionPlan = getCanvasAppFeaturePackStateTransitionPlan({
    manifests,
    operation: kind,
    options,
    targetFeaturePackIds: suiteManifest.featurePackIds,
  })
  const runtimeStatePatch = applyCanvasAppFeaturePackRuntimeStatePatch({
    featurePackIds: manifests.map((manifest) => manifest.id),
    featurePackStates: transitionPlan.featurePackStates,
    options,
  })
  const applicable = isCanvasAppFeaturePackSuiteMarketplaceActionApplicable({
    kind,
    memberState,
    suiteManifest,
  })

  return createCanvasAppFeaturePackSuiteMarketplaceAction({
    applicable,
    installOptions: runtimeStatePatch.options,
    kind,
    marketplaceBlockedReasons:
      getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasons({
        kind,
        listingById,
        stateChanges: transitionPlan.stateChanges,
      }),
    transitionPlan,
  })
}

function createCanvasAppFeaturePackSuiteMarketplaceAction({
  applicable,
  installOptions,
  kind,
  marketplaceBlockedReasons,
  transitionPlan,
}: {
  applicable: boolean
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  transitionPlan: CanvasAppFeaturePackStateTransitionPlan
}): CanvasAppFeaturePackSuiteMarketplaceAction {
  const status = applicable &&
      transitionPlan.status === 'ready' &&
      marketplaceBlockedReasons.length === 0
    ? 'ready'
    : 'blocked'

  return Object.freeze({
    applicable,
    blockedReasons: transitionPlan.blockedReasons,
    changedFeaturePackIds: transitionPlan.changedFeaturePackIds,
    featurePackStates: transitionPlan.featurePackStates,
    installOptions,
    kind,
    marketplaceBlockedReasons,
    partialUpdateSurfaceIds: transitionPlan.partialUpdateSurfaceIds,
    ready: status === 'ready',
    stateChanges: transitionPlan.stateChanges,
    status,
    uninstallPolicyEntries: transitionPlan.uninstallPolicyEntries,
  })
}

function getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasons({
  kind,
  listingById,
  stateChanges,
}: {
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
}): readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[] {
  if (kind === 'disable' || kind === 'uninstall') {
    return []
  }

  return Object.freeze(stateChanges.flatMap((stateChange) => {
    const listing = listingById.get(stateChange.id)

    if (!listing) {
      return []
    }

    return getCanvasAppFeaturePackMarketplaceListingBlockedReasons({
      installed: stateChange.from.installed,
      listing,
    })
  }))
}

function isCanvasAppFeaturePackSuiteMarketplaceActionApplicable({
  kind,
  memberState,
  suiteManifest,
}: {
  kind: CanvasAppFeaturePackSuiteMarketplaceActionKind
  memberState: ReturnType<typeof getCanvasAppFeaturePackSuiteMarketplaceMemberState>
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}) {
  if (kind === 'install') {
    return memberState.installedFeaturePackIds.length <
      suiteManifest.featurePackIds.length
  }

  if (kind === 'enable') {
    return memberState.enabledFeaturePackIds.length <
      suiteManifest.featurePackIds.length
  }

  if (kind === 'disable') {
    return memberState.enabledFeaturePackIds.length > 0
  }

  return memberState.installedFeaturePackIds.length > 0
}

function getCanvasAppFeaturePackSuiteMarketplacePrimaryActionKind(
  status: CanvasAppFeaturePackSuiteMarketplaceStatus,
): CanvasAppFeaturePackSuiteMarketplaceActionKind {
  if (status === 'uninstalled' || status === 'partial') {
    return 'install'
  }

  if (status === 'disabled') {
    return 'enable'
  }

  return 'disable'
}
