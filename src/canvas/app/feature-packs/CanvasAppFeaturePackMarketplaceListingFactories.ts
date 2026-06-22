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
import type {
  CanvasAppFeaturePackMarketplaceListing,
  CanvasAppFeaturePackMarketplaceListingAccess,
  CanvasAppFeaturePackMarketplaceListingEntitlement,
  CanvasAppFeaturePackMarketplaceListingInput,
  CanvasAppFeaturePackSuiteMarketplaceListing,
  CanvasAppFeaturePackSuiteMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListingContracts'

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
