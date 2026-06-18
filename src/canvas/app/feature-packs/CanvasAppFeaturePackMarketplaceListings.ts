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

export type CanvasAppFeaturePackMarketplaceListing = Readonly<{
  access: CanvasAppFeaturePackMarketplaceListingAccess
  distribution: CanvasAppFeaturePackMarketplaceListingDistribution
  featurePackId: CanvasAppFeaturePackId
  priceLabel?: string
  vendor?: string
}>

export type CanvasAppFeaturePackMarketplaceListingInput = Readonly<{
  access?: CanvasAppFeaturePackMarketplaceListingAccess
  distribution?: CanvasAppFeaturePackMarketplaceListingDistribution
  featurePackId: CanvasAppFeaturePackId
  priceLabel?: string
  vendor?: string
}>

export function createCanvasAppFeaturePackMarketplaceListing(
  input: CanvasAppFeaturePackMarketplaceListingInput,
): CanvasAppFeaturePackMarketplaceListing {
  assertCanvasAppFeaturePackMarketplaceListingInput(input)

  return Object.freeze({
    access: input.access ?? 'free',
    distribution: input.distribution ?? 'available',
    featurePackId: input.featurePackId,
    priceLabel: input.priceLabel,
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
