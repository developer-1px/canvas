import {
  getCanvasAppFeaturePackCatalog,
  type CanvasAppFeaturePackCatalogBlockedReason,
  type CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import {
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons as getCanvasAppFeaturePackMarketplaceListingAccessBlockedReasons,
  getCanvasAppFeaturePackMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingBlockedReason,
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeStateInput,
  type CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionBlockedReason,
  type CanvasAppFeaturePackStateTransitionChange,
  type CanvasAppFeaturePackStateTransitionOperation,
  type CanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlanStatus,
  type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
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

const CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS = Object.freeze([
  'install',
  'enable',
  'disable',
  'uninstall',
] as const satisfies readonly CanvasAppFeaturePackMarketplaceActionKind[])

export function getCanvasAppFeaturePackMarketplaceActionModel({
  listings = [],
  manifests,
  options = {},
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceActionModel {
  const catalog = getCanvasAppFeaturePackCatalog(manifests, options)
  const listingById = getCanvasAppFeaturePackMarketplaceListingMap({
    listings,
    manifests,
  })

  return Object.freeze({
    items: Object.freeze(catalog.items.map((catalogItem) =>
      getCanvasAppFeaturePackMarketplaceActionItem({
        catalogItem,
        listing: getCanvasAppFeaturePackMarketplaceActionListing({
          catalogItemId: catalogItem.id,
          listingById,
        }),
        manifests,
        options,
      }),
    )),
  })
}

function getCanvasAppFeaturePackMarketplaceActionItem({
  catalogItem,
  listing,
  manifests,
  options,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  listing: CanvasAppFeaturePackMarketplaceListing
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceActionItem {
  return Object.freeze({
    actions: Object.freeze(CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS.map(
      (kind) => getCanvasAppFeaturePackMarketplaceAction({
        catalogItem,
        kind,
        listing,
        manifests,
        options,
      }),
    )),
    catalogBlockedReasons: catalogItem.blockedReasons,
    catalogItem,
    enabled: catalogItem.enabled,
    featurePackId: catalogItem.id,
    installed: catalogItem.installed,
    listing,
    primaryActionKind:
      getCanvasAppFeaturePackMarketplacePrimaryActionKind(catalogItem),
    status: catalogItem.status,
  })
}

function getCanvasAppFeaturePackMarketplaceActionListing({
  catalogItemId,
  listingById,
}: {
  catalogItemId: CanvasAppFeaturePackId
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
}): CanvasAppFeaturePackMarketplaceListing {
  const listing = listingById.get(catalogItemId)

  if (!listing) {
    throw new Error(
      `Missing canvas app feature pack marketplace listing: ${catalogItemId}`,
    )
  }

  return listing
}

function getCanvasAppFeaturePackMarketplaceAction({
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

function getCanvasAppFeaturePackMarketplacePrimaryActionKind(
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
