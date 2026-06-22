import type {
  CanvasAppFeaturePackSuiteId,
} from './CanvasAppFeaturePackSuites'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackMarketplaceListingAccess =
  | 'free'
  | 'included'
  | 'paid'
  | 'private'

export type CanvasAppFeaturePackMarketplaceListingDistribution =
  | 'available'
  | 'coming-soon'
  | 'deprecated'
  | 'unavailable'

export type CanvasAppFeaturePackMarketplaceListingEntitlement =
  | 'granted'
  | 'required'

export type CanvasAppFeaturePackSuiteMarketplaceListingAccess =
  CanvasAppFeaturePackMarketplaceListingAccess

export type CanvasAppFeaturePackSuiteMarketplaceListingDistribution =
  CanvasAppFeaturePackMarketplaceListingDistribution

export type CanvasAppFeaturePackSuiteMarketplaceListingEntitlement =
  CanvasAppFeaturePackMarketplaceListingEntitlement

export type CanvasAppFeaturePackMarketplaceListing = Readonly<{
  access: CanvasAppFeaturePackMarketplaceListingAccess
  distribution: CanvasAppFeaturePackMarketplaceListingDistribution
  entitlement: CanvasAppFeaturePackMarketplaceListingEntitlement
  featurePackId: CanvasAppFeaturePackId
  priceLabel?: string
  vendor?: string
}>

export type CanvasAppFeaturePackSuiteMarketplaceListing = Readonly<{
  access: CanvasAppFeaturePackMarketplaceListingAccess
  distribution: CanvasAppFeaturePackMarketplaceListingDistribution
  entitlement: CanvasAppFeaturePackMarketplaceListingEntitlement
  priceLabel?: string
  suiteId: CanvasAppFeaturePackSuiteId
  vendor?: string
}>

export type CanvasAppFeaturePackMarketplaceListingEntitlementReason =
  Readonly<{
    access: CanvasAppFeaturePackMarketplaceListingAccess
    featurePackId: CanvasAppFeaturePackId
    kind: 'marketplace-entitlement-required'
  }>

export type CanvasAppFeaturePackMarketplaceListingDistributionReason =
  Readonly<{
    distribution: CanvasAppFeaturePackMarketplaceListingDistribution
    featurePackId: CanvasAppFeaturePackId
    kind: 'marketplace-distribution-unavailable'
  }>

export type CanvasAppFeaturePackMarketplaceListingBlockedReason =
  | CanvasAppFeaturePackMarketplaceListingDistributionReason
  | CanvasAppFeaturePackMarketplaceListingEntitlementReason

export type CanvasAppFeaturePackSuiteMarketplaceListingEntitlementReason =
  Readonly<{
    access: CanvasAppFeaturePackMarketplaceListingAccess
    kind: 'marketplace-entitlement-required'
    suiteId: CanvasAppFeaturePackSuiteId
  }>

export type CanvasAppFeaturePackSuiteMarketplaceListingDistributionReason =
  Readonly<{
    distribution: CanvasAppFeaturePackMarketplaceListingDistribution
    kind: 'marketplace-distribution-unavailable'
    suiteId: CanvasAppFeaturePackSuiteId
  }>

export type CanvasAppFeaturePackSuiteMarketplaceListingBlockedReason =
  | CanvasAppFeaturePackSuiteMarketplaceListingDistributionReason
  | CanvasAppFeaturePackSuiteMarketplaceListingEntitlementReason

export type CanvasAppFeaturePackMarketplaceListingInput = Readonly<{
  access?: CanvasAppFeaturePackMarketplaceListingAccess
  distribution?: CanvasAppFeaturePackMarketplaceListingDistribution
  entitlement?: CanvasAppFeaturePackMarketplaceListingEntitlement
  featurePackId: CanvasAppFeaturePackId
  priceLabel?: string
  vendor?: string
}>

export type CanvasAppFeaturePackSuiteMarketplaceListingInput = Readonly<{
  access?: CanvasAppFeaturePackMarketplaceListingAccess
  distribution?: CanvasAppFeaturePackMarketplaceListingDistribution
  entitlement?: CanvasAppFeaturePackMarketplaceListingEntitlement
  priceLabel?: string
  suiteId: CanvasAppFeaturePackSuiteId
  vendor?: string
}>
