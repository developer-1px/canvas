import {
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackSuiteManifests,
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'
import {
  type CanvasAppFeaturePackId,
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

export function createCanvasAppFeaturePackMarketplaceListing(
  input: CanvasAppFeaturePackMarketplaceListingInput,
): CanvasAppFeaturePackMarketplaceListing {
  assertCanvasAppFeaturePackMarketplaceListingInput(input)

  return Object.freeze({
    access: input.access ?? 'free',
    distribution: input.distribution ?? 'available',
    entitlement: input.entitlement ??
      getCanvasAppFeaturePackMarketplaceListingDefaultEntitlement(
        input.access ?? 'free',
      ),
    featurePackId: input.featurePackId,
    priceLabel: input.priceLabel,
    vendor: input.vendor,
  })
}

export function createCanvasAppFeaturePackSuiteMarketplaceListing(
  input: CanvasAppFeaturePackSuiteMarketplaceListingInput,
): CanvasAppFeaturePackSuiteMarketplaceListing {
  assertCanvasAppFeaturePackSuiteMarketplaceListingInput(input)

  return Object.freeze({
    access: input.access ?? 'free',
    distribution: input.distribution ?? 'available',
    entitlement: input.entitlement ??
      getCanvasAppFeaturePackMarketplaceListingDefaultEntitlement(
        input.access ?? 'free',
      ),
    priceLabel: input.priceLabel,
    suiteId: input.suiteId,
    vendor: input.vendor,
  })
}

export function getCanvasAppFeaturePackMarketplaceListingMap({
  listings = [],
  manifests,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
}): ReadonlyMap<
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackMarketplaceListing
> {
  assertCanvasAppFeaturePackManifests(manifests)

  const manifestIds = new Set(manifests.map((manifest) => manifest.id))
  const listingById = new Map<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >()
  const inputListingIds = new Set<CanvasAppFeaturePackId>()

  for (const manifest of manifests) {
    listingById.set(
      manifest.id,
      createCanvasAppFeaturePackMarketplaceListing({
        featurePackId: manifest.id,
      }),
    )
  }

  for (const input of listings) {
    const listing = createCanvasAppFeaturePackMarketplaceListing(input)

    if (!manifestIds.has(listing.featurePackId)) {
      throw new Error(
        `Unknown canvas app feature pack marketplace listing: ${listing.featurePackId}`,
      )
    }

    if (inputListingIds.has(listing.featurePackId)) {
      throw new Error(
        `Duplicate canvas app feature pack marketplace listing: ${listing.featurePackId}`,
      )
    }

    inputListingIds.add(listing.featurePackId)
    listingById.set(listing.featurePackId, listing)
  }

  return listingById
}

export function getCanvasAppFeaturePackSuiteMarketplaceListingMap({
  listings = [],
  suiteManifests,
}: {
  listings?: readonly CanvasAppFeaturePackSuiteMarketplaceListingInput[]
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[]
}): ReadonlyMap<
  CanvasAppFeaturePackSuiteId,
  CanvasAppFeaturePackSuiteMarketplaceListing
> {
  assertCanvasAppFeaturePackSuiteManifests(suiteManifests)

  const suiteIds = new Set(suiteManifests.map((suite) => suite.id))
  const listingById = new Map<
    CanvasAppFeaturePackSuiteId,
    CanvasAppFeaturePackSuiteMarketplaceListing
  >()
  const inputListingIds = new Set<CanvasAppFeaturePackSuiteId>()

  for (const suiteManifest of suiteManifests) {
    listingById.set(
      suiteManifest.id,
      createCanvasAppFeaturePackSuiteMarketplaceListing({
        suiteId: suiteManifest.id,
      }),
    )
  }

  for (const input of listings) {
    const listing = createCanvasAppFeaturePackSuiteMarketplaceListing(input)

    if (!suiteIds.has(listing.suiteId)) {
      throw new Error(
        `Unknown canvas app feature pack suite marketplace listing: ${listing.suiteId}`,
      )
    }

    if (inputListingIds.has(listing.suiteId)) {
      throw new Error(
        `Duplicate canvas app feature pack suite marketplace listing: ${listing.suiteId}`,
      )
    }

    inputListingIds.add(listing.suiteId)
    listingById.set(listing.suiteId, listing)
  }

  return listingById
}

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

function assertCanvasAppFeaturePackMarketplaceListingInput(
  input: CanvasAppFeaturePackMarketplaceListingInput,
) {
  assertCanvasAppExtensionId({
    id: input.featurePackId,
    label: 'feature pack marketplace listing',
  })

  if (
    input.access !== undefined &&
    input.access !== 'free' &&
    input.access !== 'included' &&
    input.access !== 'paid' &&
    input.access !== 'private'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing access: ${input.access}`,
    )
  }

  if (
    input.distribution !== undefined &&
    input.distribution !== 'available' &&
    input.distribution !== 'coming-soon' &&
    input.distribution !== 'deprecated' &&
    input.distribution !== 'unavailable'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing distribution: ${input.distribution}`,
    )
  }

  if (
    input.entitlement !== undefined &&
    input.entitlement !== 'granted' &&
    input.entitlement !== 'required'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing entitlement: ${input.entitlement}`,
    )
  }

  if (input.priceLabel !== undefined) {
    assertCanvasAppDescriptorStringField({
      field: 'priceLabel',
      owner: `feature pack marketplace listing ${input.featurePackId}`,
      value: input.priceLabel,
    })
  }

  if (input.vendor !== undefined) {
    assertCanvasAppDescriptorStringField({
      field: 'vendor',
      owner: `feature pack marketplace listing ${input.featurePackId}`,
      value: input.vendor,
    })
  }
}

function assertCanvasAppFeaturePackSuiteMarketplaceListingInput(
  input: CanvasAppFeaturePackSuiteMarketplaceListingInput,
) {
  assertCanvasAppExtensionId({
    id: input.suiteId,
    label: 'feature pack suite marketplace listing',
  })

  if (
    input.access !== undefined &&
    input.access !== 'free' &&
    input.access !== 'included' &&
    input.access !== 'paid' &&
    input.access !== 'private'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing access: ${input.access}`,
    )
  }

  if (
    input.distribution !== undefined &&
    input.distribution !== 'available' &&
    input.distribution !== 'coming-soon' &&
    input.distribution !== 'deprecated' &&
    input.distribution !== 'unavailable'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing distribution: ${input.distribution}`,
    )
  }

  if (
    input.entitlement !== undefined &&
    input.entitlement !== 'granted' &&
    input.entitlement !== 'required'
  ) {
    throw new Error(
      `Invalid canvas app feature pack marketplace listing entitlement: ${input.entitlement}`,
    )
  }

  if (input.priceLabel !== undefined) {
    assertCanvasAppDescriptorStringField({
      field: 'priceLabel',
      owner: `feature pack suite marketplace listing ${input.suiteId}`,
      value: input.priceLabel,
    })
  }

  if (input.vendor !== undefined) {
    assertCanvasAppDescriptorStringField({
      field: 'vendor',
      owner: `feature pack suite marketplace listing ${input.suiteId}`,
      value: input.vendor,
    })
  }
}

function getCanvasAppFeaturePackMarketplaceListingDefaultEntitlement(
  access: CanvasAppFeaturePackMarketplaceListingAccess,
): CanvasAppFeaturePackMarketplaceListingEntitlement {
  if (access === 'paid' || access === 'private') {
    return 'required'
  }

  return 'granted'
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
