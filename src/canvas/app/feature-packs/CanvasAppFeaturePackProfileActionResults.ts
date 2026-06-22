import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingBlockedReason,
} from './CanvasAppFeaturePackMarketplaceListings'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackProfileMarketplaceBlockedReason,
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplaceStateChange,
  CanvasAppFeaturePackProfileMarketplaceStatus,
  CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntries({
  context,
  stateChanges,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
}): readonly CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry[] {
  return Object.freeze(stateChanges.flatMap((change) => {
    if (!change.from.installed || change.to.installed) {
      return []
    }

    const manifest = context.manifestById.get(change.id)

    if (!manifest) {
      return []
    }

    return [Object.freeze({
      featurePackId: change.id,
      orphanedDataScopeIds: manifest.lifecycle.orphanedDataScopeIds,
      orphanedDataPolicy: manifest.lifecycle.orphanedDataPolicy,
    })]
  }))
}

export function getCanvasAppFeaturePackProfileMarketplaceStatus({
  blockedReasons,
  marketplaceBlockedReasons,
  stateChanges,
}: {
  blockedReasons: readonly CanvasAppFeaturePackProfileMarketplaceBlockedReason[]
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
}): CanvasAppFeaturePackProfileMarketplaceStatus {
  if (blockedReasons.length > 0 || marketplaceBlockedReasons.length > 0) {
    return 'blocked'
  }

  if (stateChanges.length === 0) {
    return 'active'
  }

  return 'ready'
}

export function getCanvasAppFeaturePackProfileMarketplaceListingBlockedReasons({
  listingById,
  stateChanges,
}: {
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
}): readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[] {
  return Object.freeze(stateChanges.flatMap((stateChange) => {
    if (!isCanvasAppFeaturePackProfileMarketplaceListingBlockedChange(
      stateChange,
    )) {
      return []
    }

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

export function getCanvasAppFeaturePackProfileMarketplaceInstalledFeaturePackIds(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    states.filter((state) => state.installed).map((state) => state.id),
  )
}

export function getCanvasAppFeaturePackProfileMarketplaceEnabledFeaturePackIds(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    states.filter((state) => state.enabled).map((state) => state.id),
  )
}

function isCanvasAppFeaturePackProfileMarketplaceListingBlockedChange(
  stateChange: CanvasAppFeaturePackProfileMarketplaceStateChange,
) {
  return (
    stateChange.to.installed && !stateChange.from.installed
  ) || (
    stateChange.to.enabled && !stateChange.from.enabled
  )
}
