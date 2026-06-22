import {
  getCanvasAppFeaturePackCatalog,
  type CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import {
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons as getCanvasAppFeaturePackMarketplaceListingAccessBlockedReasons,
  getCanvasAppFeaturePackMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  createCanvasAppFeaturePackMarketplacePackageState,
  createCanvasAppFeaturePackMarketplacePackPackageContract,
  getCanvasAppFeaturePackMarketplacePackPackagePrimaryStatus,
  getCanvasAppFeaturePackMarketplacePackPackageStatuses,
} from './CanvasAppFeaturePackMarketplacePackages'
import {
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import {
  CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS,
  type CanvasAppFeaturePackMarketplaceActionItem,
  type CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActionContracts'
export type {
  CanvasAppFeaturePackMarketplaceAction,
  CanvasAppFeaturePackMarketplaceActionItem,
  CanvasAppFeaturePackMarketplaceActionKind,
  CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActionContracts'
import {
  getCanvasAppFeaturePackMarketplaceAction,
  getCanvasAppFeaturePackMarketplaceActionItemPrimaryAction,
  getCanvasAppFeaturePackMarketplacePrimaryActionKind,
} from './CanvasAppFeaturePackActionPlans'

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
  const actions = Object.freeze(CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS.map(
    (kind) => getCanvasAppFeaturePackMarketplaceAction({
      catalogItem,
      kind,
      listing,
      manifests,
      options,
    }),
  ))
  const primaryActionKind =
    getCanvasAppFeaturePackMarketplacePrimaryActionKind(catalogItem)
  const primaryAction =
    getCanvasAppFeaturePackMarketplaceActionItemPrimaryAction({
      actions,
      primaryActionKind,
    })
  const listingBlockedReasons =
    getCanvasAppFeaturePackMarketplaceListingAccessBlockedReasons({
      installed: catalogItem.installed,
      listing,
    })
  const primaryBlockedReasonCount = primaryAction.blockedReasons.length
  const primaryMarketplaceBlockedReasonCount =
    primaryAction.marketplaceBlockedReasons.length
  const primaryTotalBlockedReasonCount =
    primaryBlockedReasonCount + primaryMarketplaceBlockedReasonCount

  return Object.freeze({
    actions,
    catalogBlockedReasons: catalogItem.blockedReasons,
    catalogItem,
    enabled: catalogItem.enabled,
    featurePackId: catalogItem.id,
    installed: catalogItem.installed,
    listing,
    packageContract:
      createCanvasAppFeaturePackMarketplacePackPackageContract({
        catalogItem,
        listing,
        listingBlockedReasonCount: listingBlockedReasons.length,
      }),
    packageState: createCanvasAppFeaturePackMarketplacePackageState({
      actionKind: primaryAction.kind,
      actionStatus: primaryAction.status,
      blockedReasonCount: primaryBlockedReasonCount,
      enabled: catalogItem.enabled,
      id: catalogItem.id,
      installed: catalogItem.installed,
      kind: 'pack',
      marketplaceBlockedReasonCount: primaryMarketplaceBlockedReasonCount,
      partialUpdateSurfaceIds: primaryAction.partialUpdateSurfaceIds,
      primaryStatus:
        getCanvasAppFeaturePackMarketplacePackPackagePrimaryStatus({
          actionStatus: primaryAction.status,
          enabled: catalogItem.enabled,
          installed: catalogItem.installed,
          runtimeStatus: catalogItem.status,
          totalBlockedReasonCount: primaryTotalBlockedReasonCount,
        }),
      ready: primaryAction.ready,
      statuses: getCanvasAppFeaturePackMarketplacePackPackageStatuses({
        actionStatus: primaryAction.status,
        enabled: catalogItem.enabled,
        installed: catalogItem.installed,
        runtimeStatus: catalogItem.status,
        totalBlockedReasonCount: primaryTotalBlockedReasonCount,
      }),
    }),
    primaryActionKind,
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
