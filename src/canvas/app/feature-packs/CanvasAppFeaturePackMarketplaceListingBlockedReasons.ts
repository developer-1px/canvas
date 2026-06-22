import type {
  CanvasAppFeaturePackMarketplaceListing,
  CanvasAppFeaturePackMarketplaceListingBlockedReason,
  CanvasAppFeaturePackMarketplaceListingDistributionReason,
  CanvasAppFeaturePackMarketplaceListingEntitlementReason,
  CanvasAppFeaturePackSuiteMarketplaceListing,
  CanvasAppFeaturePackSuiteMarketplaceListingBlockedReason,
  CanvasAppFeaturePackSuiteMarketplaceListingDistributionReason,
  CanvasAppFeaturePackSuiteMarketplaceListingEntitlementReason,
} from './CanvasAppFeaturePackMarketplaceListingContracts'

export function getCanvasAppFeaturePackMarketplaceListingBlockedReasons({
  installed,
  listing,
}: {
  installed: boolean
  listing: CanvasAppFeaturePackMarketplaceListing
}): readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[] {
  return Object.freeze([
    ...getCanvasAppFeaturePackMarketplaceListingEntitlementBlockedReasons(
      listing,
    ),
    ...getCanvasAppFeaturePackMarketplaceListingDistributionBlockedReasons({
      installed,
      listing,
    }),
  ])
}

export function getCanvasAppFeaturePackSuiteMarketplaceListingBlockedReasons({
  installed,
  listing,
}: {
  installed: boolean
  listing: CanvasAppFeaturePackSuiteMarketplaceListing
}): readonly CanvasAppFeaturePackSuiteMarketplaceListingBlockedReason[] {
  return Object.freeze([
    ...getCanvasAppFeaturePackSuiteMarketplaceListingEntitlementBlockedReasons(
      listing,
    ),
    ...getCanvasAppFeaturePackSuiteMarketplaceListingDistributionBlockedReasons({
      installed,
      listing,
    }),
  ])
}

function getCanvasAppFeaturePackMarketplaceListingEntitlementBlockedReasons(
  listing: CanvasAppFeaturePackMarketplaceListing,
): readonly CanvasAppFeaturePackMarketplaceListingEntitlementReason[] {
  if (listing.entitlement === 'granted') {
    return []
  }

  return [Object.freeze({
    access: listing.access,
    featurePackId: listing.featurePackId,
    kind: 'marketplace-entitlement-required',
  })]
}

function getCanvasAppFeaturePackSuiteMarketplaceListingEntitlementBlockedReasons(
  listing: CanvasAppFeaturePackSuiteMarketplaceListing,
): readonly CanvasAppFeaturePackSuiteMarketplaceListingEntitlementReason[] {
  if (listing.entitlement === 'granted') {
    return []
  }

  return [Object.freeze({
    access: listing.access,
    kind: 'marketplace-entitlement-required',
    suiteId: listing.suiteId,
  })]
}

function getCanvasAppFeaturePackMarketplaceListingDistributionBlockedReasons({
  installed,
  listing,
}: {
  installed: boolean
  listing: CanvasAppFeaturePackMarketplaceListing
}): readonly CanvasAppFeaturePackMarketplaceListingDistributionReason[] {
  if (installed || listing.distribution === 'available') {
    return []
  }

  return [Object.freeze({
    distribution: listing.distribution,
    featurePackId: listing.featurePackId,
    kind: 'marketplace-distribution-unavailable',
  })]
}

function getCanvasAppFeaturePackSuiteMarketplaceListingDistributionBlockedReasons({
  installed,
  listing,
}: {
  installed: boolean
  listing: CanvasAppFeaturePackSuiteMarketplaceListing
}): readonly CanvasAppFeaturePackSuiteMarketplaceListingDistributionReason[] {
  if (installed || listing.distribution === 'available') {
    return []
  }

  return [Object.freeze({
    distribution: listing.distribution,
    kind: 'marketplace-distribution-unavailable',
    suiteId: listing.suiteId,
  })]
}
