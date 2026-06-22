import {
  type CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import {
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestCategory,
  type CanvasAppFeaturePackManifestCompatibility,
  type CanvasAppFeaturePackManifestContributions,
  type CanvasAppFeaturePackManifestLifecycle,
  type CanvasAppFeaturePackManifestPackage,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingAccess,
  type CanvasAppFeaturePackMarketplaceListingDistribution,
  type CanvasAppFeaturePackMarketplaceListingEntitlement,
  type CanvasAppFeaturePackSuiteMarketplaceListing,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import {
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePacks'
import {
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

export type CanvasAppFeaturePackMarketplacePackageListingState = Readonly<{
  access: CanvasAppFeaturePackMarketplaceListingAccess
  blocked: boolean
  blockedReasonCount: number
  distribution: CanvasAppFeaturePackMarketplaceListingDistribution
  entitlement: CanvasAppFeaturePackMarketplaceListingEntitlement
  priceLabel?: string
  vendor?: string
}>

export type CanvasAppFeaturePackMarketplacePackageMemberContract = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  label: string
  package: CanvasAppFeaturePackManifestPackage
  status?: CanvasAppFeaturePackRuntimeStateStatus
  version: string
}>

export type CanvasAppFeaturePackMarketplacePackPackageContract = Readonly<{
  category: CanvasAppFeaturePackManifestCategory
  compatibility: CanvasAppFeaturePackManifestCompatibility
  conflicts: readonly CanvasAppFeaturePackId[]
  contributes: CanvasAppFeaturePackManifestContributions
  featurePackId: CanvasAppFeaturePackId
  id: CanvasAppFeaturePackId
  kind: 'pack'
  label: string
  lifecycle: CanvasAppFeaturePackManifestLifecycle
  listing: CanvasAppFeaturePackMarketplacePackageListingState
  optionalRequires: readonly CanvasAppFeaturePackId[]
  package: CanvasAppFeaturePackManifestPackage
  provides: readonly CanvasAppFeaturePackId[]
  requires: readonly CanvasAppFeaturePackId[]
  version: string
}>

export type CanvasAppFeaturePackMarketplaceSuitePackageContract = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  id: CanvasAppFeaturePackSuiteId
  kind: 'suite'
  label: string
  listing: CanvasAppFeaturePackMarketplacePackageListingState
  memberPackages: readonly CanvasAppFeaturePackMarketplacePackageMemberContract[]
  suiteId: CanvasAppFeaturePackSuiteId
}>

export type CanvasAppFeaturePackMarketplaceProfilePackageContract = Readonly<{
  id: CanvasAppFeaturePackProfileId
  kind: 'profile'
  label: string
  memberPackages: readonly CanvasAppFeaturePackMarketplacePackageMemberContract[]
  profileId: CanvasAppFeaturePackProfileId
  targetEnabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  targetInstalledFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackMarketplacePackageContract =
  | CanvasAppFeaturePackMarketplacePackPackageContract
  | CanvasAppFeaturePackMarketplaceProfilePackageContract
  | CanvasAppFeaturePackMarketplaceSuitePackageContract

export function createCanvasAppFeaturePackMarketplacePackPackageContract({
  catalogItem,
  listing,
  listingBlockedReasonCount,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  listing: CanvasAppFeaturePackMarketplaceListing
  listingBlockedReasonCount: number
}): CanvasAppFeaturePackMarketplacePackPackageContract {
  return Object.freeze({
    category: catalogItem.category,
    compatibility: catalogItem.compatibility,
    conflicts: catalogItem.conflicts,
    contributes: catalogItem.contributes,
    featurePackId: catalogItem.id,
    id: catalogItem.id,
    kind: 'pack',
    label: catalogItem.label,
    lifecycle: catalogItem.lifecycle,
    listing: createCanvasAppFeaturePackMarketplacePackageListingState({
      blockedReasonCount: listingBlockedReasonCount,
      listing,
    }),
    optionalRequires: catalogItem.optionalRequires,
    package: catalogItem.package,
    provides: catalogItem.provides,
    requires: catalogItem.requires,
    version: catalogItem.version,
  })
}

export function createCanvasAppFeaturePackMarketplaceSuitePackageContract({
  listing,
  listingBlockedReasonCount,
  manifests,
  states,
  suiteManifest,
}: {
  listing: CanvasAppFeaturePackSuiteMarketplaceListing
  listingBlockedReasonCount: number
  manifests: readonly CanvasAppFeaturePackManifest[]
  states: readonly CanvasAppFeaturePackRuntimeState[]
  suiteManifest: CanvasAppFeaturePackSuiteManifest
}): CanvasAppFeaturePackMarketplaceSuitePackageContract {
  return Object.freeze({
    featurePackIds: suiteManifest.featurePackIds,
    id: suiteManifest.id,
    kind: 'suite',
    label: suiteManifest.label,
    listing: createCanvasAppFeaturePackMarketplacePackageListingState({
      blockedReasonCount: listingBlockedReasonCount,
      listing,
    }),
    memberPackages: getCanvasAppFeaturePackMarketplacePackageMemberContracts({
      featurePackIds: suiteManifest.featurePackIds,
      manifests,
      states,
    }),
    suiteId: suiteManifest.id,
  })
}

export function createCanvasAppFeaturePackMarketplaceProfilePackageContract({
  currentStates,
  manifests,
  profile,
}: {
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  profile: CanvasAppFeaturePackProfile
}): CanvasAppFeaturePackMarketplaceProfilePackageContract {
  return Object.freeze({
    id: profile.id,
    kind: 'profile',
    label: profile.label,
    memberPackages: getCanvasAppFeaturePackMarketplacePackageMemberContracts({
      featurePackIds: getUniqueCanvasAppFeaturePackMarketplacePackageMemberIds([
        ...profile.installedFeaturePackIds,
        ...profile.enabledFeaturePackIds,
      ]),
      manifests,
      states: currentStates,
    }),
    profileId: profile.id,
    targetEnabledFeaturePackIds: profile.enabledFeaturePackIds,
    targetInstalledFeaturePackIds: profile.installedFeaturePackIds,
  })
}

function createCanvasAppFeaturePackMarketplacePackageListingState({
  blockedReasonCount,
  listing,
}: {
  blockedReasonCount: number
  listing:
    | CanvasAppFeaturePackMarketplaceListing
    | CanvasAppFeaturePackSuiteMarketplaceListing
}): CanvasAppFeaturePackMarketplacePackageListingState {
  return Object.freeze({
    access: listing.access,
    blocked: blockedReasonCount > 0,
    blockedReasonCount,
    distribution: listing.distribution,
    entitlement: listing.entitlement,
    priceLabel: listing.priceLabel,
    vendor: listing.vendor,
  })
}

function getCanvasAppFeaturePackMarketplacePackageMemberContracts({
  featurePackIds,
  manifests,
  states,
}: {
  featurePackIds: readonly CanvasAppFeaturePackId[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  states: readonly CanvasAppFeaturePackRuntimeState[]
}): readonly CanvasAppFeaturePackMarketplacePackageMemberContract[] {
  const manifestById = new Map(manifests.map((manifest) => [
    manifest.id,
    manifest,
  ]))
  const stateById = new Map(states.map((state) => [state.id, state]))

  return Object.freeze(featurePackIds.flatMap((featurePackId) => {
    const manifest = manifestById.get(featurePackId)

    if (!manifest) {
      return []
    }

    return [Object.freeze({
      featurePackId: manifest.id,
      label: manifest.label,
      package: manifest.package,
      status: stateById.get(manifest.id)?.status,
      version: manifest.version,
    })]
  }))
}

function getUniqueCanvasAppFeaturePackMarketplacePackageMemberIds(
  ids: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...new Set(ids)])
}
