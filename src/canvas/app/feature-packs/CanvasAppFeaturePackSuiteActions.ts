import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingMap,
  getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasons as getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasonsForListing,
  getCanvasAppFeaturePackSuiteMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackSuiteMarketplaceListing,
  type CanvasAppFeaturePackSuiteMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  createCanvasAppFeaturePackMarketplacePackageState,
  createCanvasAppFeaturePackMarketplaceSuitePackageContract,
  getCanvasAppFeaturePackMarketplaceSuitePackagePrimaryStatus,
  getCanvasAppFeaturePackMarketplaceSuitePackageStatuses,
} from './CanvasAppFeaturePackMarketplacePackages'
import {
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
  assertCanvasAppFeaturePackSuiteManifests,
} from './CanvasAppFeaturePackSuites'
import {
  CANVAS_APP_FEATURE_PACK_SUITE_MARKETPLACE_ACTION_KINDS,
  type CanvasAppFeaturePackSuiteMarketplaceActionItem,
  type CanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActionContracts'
export type {
  CanvasAppFeaturePackSuiteMarketplaceAction,
  CanvasAppFeaturePackSuiteMarketplaceActionItem,
  CanvasAppFeaturePackSuiteMarketplaceActionKind,
  CanvasAppFeaturePackSuiteMarketplaceActionModel,
  CanvasAppFeaturePackSuiteMarketplaceBlockedReason,
  CanvasAppFeaturePackSuiteMarketplaceStatus,
} from './CanvasAppFeaturePackSuiteActionContracts'
import {
  getCanvasAppFeaturePackSuiteMarketplaceAction,
  getCanvasAppFeaturePackSuiteMarketplaceActionItemPrimaryAction,
  getCanvasAppFeaturePackSuiteMarketplaceMemberState,
  getCanvasAppFeaturePackSuiteMarketplacePrimaryActionKind,
  getCanvasAppFeaturePackSuiteMarketplaceStatus,
} from './CanvasAppFeaturePackSuiteActionPlans'

export function getCanvasAppFeaturePackSuiteMarketplaceActionModel({
  listings = [],
  manifests,
  options = {},
  suiteListings = [],
  suiteManifests,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  suiteListings?: readonly CanvasAppFeaturePackSuiteMarketplaceListingInput[]
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
  const suiteListingById = getCanvasAppFeaturePackSuiteMarketplaceListingMap({
    listings: suiteListings,
    suiteManifests,
  })

  return Object.freeze({
    items: Object.freeze(suiteManifests.map((suiteManifest) =>
      getCanvasAppFeaturePackSuiteMarketplaceActionItem({
        listingById,
        manifests,
        options,
        states,
        suiteListingById,
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
  suiteListingById,
  suiteManifest,
}: {
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
  states: readonly CanvasAppFeaturePackRuntimeState[]
  suiteListingById: ReadonlyMap<
    CanvasAppFeaturePackSuiteId,
    CanvasAppFeaturePackSuiteMarketplaceListing
  >
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
  const listing = suiteListingById.get(suiteManifest.id)

  if (!listing) {
    throw new Error(
      `Missing canvas app feature pack suite marketplace listing: ${suiteManifest.id}`,
    )
  }
  const actions = Object.freeze(
    CANVAS_APP_FEATURE_PACK_SUITE_MARKETPLACE_ACTION_KINDS.map((kind) =>
      getCanvasAppFeaturePackSuiteMarketplaceAction({
        kind,
        listingById,
        listing,
        manifests,
        memberState,
        options,
        suiteManifest,
      })
    ),
  )
  const primaryActionKind =
    getCanvasAppFeaturePackSuiteMarketplacePrimaryActionKind(status)
  const primaryAction =
    getCanvasAppFeaturePackSuiteMarketplaceActionItemPrimaryAction({
      actions,
      primaryActionKind,
    })
  const suiteListingBlockedReasons =
    getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasonsForListing({
      installed: memberState.installedFeaturePackIds.length ===
        suiteManifest.featurePackIds.length,
      listing,
    })
  const primaryBlockedReasonCount = primaryAction.blockedReasons.length
  const primaryMarketplaceBlockedReasonCount =
    primaryAction.marketplaceBlockedReasons.length
  const primaryTotalBlockedReasonCount =
    primaryBlockedReasonCount + primaryMarketplaceBlockedReasonCount

  return Object.freeze({
    actions,
    enabledFeaturePackIds: memberState.enabledFeaturePackIds,
    featurePackIds: suiteManifest.featurePackIds,
    installedFeaturePackIds: memberState.installedFeaturePackIds,
    label: suiteManifest.label,
    listing,
    missingFeaturePackIds: memberState.missingFeaturePackIds,
    packageContract:
      createCanvasAppFeaturePackMarketplaceSuitePackageContract({
        listing,
        listingBlockedReasonCount: suiteListingBlockedReasons.length,
        manifests,
        states,
        suiteManifest,
      }),
    packageState: createCanvasAppFeaturePackMarketplacePackageState({
      actionKind: primaryAction.kind,
      actionStatus: primaryAction.status,
      blockedReasonCount: primaryBlockedReasonCount,
      enabled: status === 'enabled',
      id: suiteManifest.id,
      installed: memberState.installedFeaturePackIds.length ===
        suiteManifest.featurePackIds.length,
      kind: 'suite',
      marketplaceBlockedReasonCount: primaryMarketplaceBlockedReasonCount,
      partialUpdateSurfaceIds: primaryAction.partialUpdateSurfaceIds,
      primaryStatus:
        getCanvasAppFeaturePackMarketplaceSuitePackagePrimaryStatus({
          actionStatus: primaryAction.status,
          status,
          totalBlockedReasonCount: primaryTotalBlockedReasonCount,
        }),
      ready: primaryAction.ready,
      statuses: getCanvasAppFeaturePackMarketplaceSuitePackageStatuses({
        actionStatus: primaryAction.status,
        status,
        totalBlockedReasonCount: primaryTotalBlockedReasonCount,
      }),
    }),
    primaryActionKind,
    status,
    suiteId: suiteManifest.id,
  })
}
