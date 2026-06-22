import type {
  CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons as getCanvasAppFeaturePackMarketplaceListingAccessBlockedReasons,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingBlockedReason,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackInstallOptions,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlan,
} from './CanvasAppFeaturePackStateTransitionPlan'
import type {
  CanvasAppFeaturePackMarketplaceAction,
  CanvasAppFeaturePackMarketplaceActionKind,
} from './CanvasAppFeaturePackActionContracts'

export function getCanvasAppFeaturePackMarketplaceActionItemPrimaryAction({
  actions,
  primaryActionKind,
}: {
  actions: readonly CanvasAppFeaturePackMarketplaceAction[]
  primaryActionKind: CanvasAppFeaturePackMarketplaceActionKind
}): CanvasAppFeaturePackMarketplaceAction {
  const action = actions.find((candidate) => candidate.kind === primaryActionKind)

  if (!action) {
    throw new Error(
      `Missing canvas app feature pack marketplace action: ${primaryActionKind}`,
    )
  }

  return action
}

export function getCanvasAppFeaturePackMarketplaceAction({
  catalogItem,
  kind,
  listing,
  manifests,
  options,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  kind: CanvasAppFeaturePackMarketplaceActionKind
  listing: CanvasAppFeaturePackMarketplaceListing
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceAction {
  const transitionPlan = getCanvasAppFeaturePackStateTransitionPlan({
    manifests,
    operation: kind,
    options,
    targetFeaturePackIds: [catalogItem.id],
  })
  const runtimeStatePatch = applyCanvasAppFeaturePackRuntimeStatePatch({
    featurePackIds: manifests.map((manifest) => manifest.id),
    featurePackStates: transitionPlan.featurePackStates,
    options,
  })

  return createCanvasAppFeaturePackMarketplaceAction({
    applicable: isCanvasAppFeaturePackMarketplaceActionApplicable({
      catalogItem,
      kind,
    }),
    installOptions: runtimeStatePatch.options,
    kind,
    marketplaceBlockedReasons:
      getCanvasAppFeaturePackMarketplaceActionListingBlockedReasons({
        catalogItem,
        kind,
        listing,
      }),
    transitionPlan,
  })
}

export function getCanvasAppFeaturePackMarketplacePrimaryActionKind(
  catalogItem: CanvasAppFeaturePackCatalogItem,
): CanvasAppFeaturePackMarketplaceActionKind {
  if (!catalogItem.installed) {
    return 'install'
  }

  if (!catalogItem.enabled) {
    return 'enable'
  }

  return 'disable'
}

function createCanvasAppFeaturePackMarketplaceAction({
  applicable,
  installOptions,
  kind,
  marketplaceBlockedReasons,
  transitionPlan,
}: {
  applicable: boolean
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  transitionPlan: CanvasAppFeaturePackStateTransitionPlan
}): CanvasAppFeaturePackMarketplaceAction {
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

function getCanvasAppFeaturePackMarketplaceActionListingBlockedReasons({
  catalogItem,
  kind,
  listing,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  kind: CanvasAppFeaturePackMarketplaceActionKind
  listing: CanvasAppFeaturePackMarketplaceListing
}): readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[] {
  if (kind === 'disable' || kind === 'uninstall') {
    return []
  }

  return Object.freeze([
    ...getCanvasAppFeaturePackMarketplaceListingAccessBlockedReasons({
      installed: catalogItem.installed,
      listing,
    }),
  ])
}

function isCanvasAppFeaturePackMarketplaceActionApplicable({
  catalogItem,
  kind,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  kind: CanvasAppFeaturePackMarketplaceActionKind
}) {
  if (kind === 'install') {
    return !catalogItem.installed
  }

  if (kind === 'enable') {
    return !catalogItem.enabled
  }

  if (kind === 'disable') {
    return catalogItem.enabled
  }

  return catalogItem.installed
}
