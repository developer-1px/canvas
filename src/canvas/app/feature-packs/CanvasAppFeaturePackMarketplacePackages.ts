import {
  type CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import {
  type CanvasAppFeaturePackContributionSurface,
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

export type CanvasAppFeaturePackMarketplacePackageKind =
  | 'pack'
  | 'profile'
  | 'suite'

export type CanvasAppFeaturePackMarketplacePackageStatus =
  | 'activation-failed'
  | 'active'
  | 'available'
  | 'blocked'
  | 'disabled'
  | 'enabled'
  | 'installed'
  | 'partial'
  | 'partially-updated'
  | 'ready'
  | 'rollback-available'
  | 'updating'

export type CanvasAppFeaturePackMarketplacePackageActionKind =
  | 'apply'
  | 'disable'
  | 'enable'
  | 'install'
  | 'uninstall'

export type CanvasAppFeaturePackMarketplacePackageActionStatus =
  | 'active'
  | 'blocked'
  | 'ready'

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

export type CanvasAppFeaturePackMarketplacePackageState = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePackageActionKind
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  active: boolean
  blocked: boolean
  blockedReasonCount: number
  enabled: boolean
  id: string
  installed: boolean
  kind: CanvasAppFeaturePackMarketplacePackageKind
  marketplaceBlockedReasonCount: number
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  primaryStatus: CanvasAppFeaturePackMarketplacePackageStatus
  ready: boolean
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[]
  totalBlockedReasonCount: number
}>

export type CanvasAppFeaturePackMarketplacePackageStateInput = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePackageActionKind
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  active?: boolean
  blockedReasonCount: number
  enabled: boolean
  id: string
  installed: boolean
  kind: CanvasAppFeaturePackMarketplacePackageKind
  marketplaceBlockedReasonCount: number
  partialUpdateSurfaceIds?: readonly CanvasAppFeaturePackContributionSurface[]
  primaryStatus: CanvasAppFeaturePackMarketplacePackageStatus
  ready: boolean
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[]
}>

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

export function createCanvasAppFeaturePackMarketplacePackageState(
  input: CanvasAppFeaturePackMarketplacePackageStateInput,
): CanvasAppFeaturePackMarketplacePackageState {
  const totalBlockedReasonCount =
    input.blockedReasonCount + input.marketplaceBlockedReasonCount

  return Object.freeze({
    actionKind: input.actionKind,
    actionStatus: input.actionStatus,
    active: input.active ?? input.enabled,
    blocked: input.actionStatus === 'blocked' && totalBlockedReasonCount > 0,
    blockedReasonCount: input.blockedReasonCount,
    enabled: input.enabled,
    id: input.id,
    installed: input.installed,
    kind: input.kind,
    marketplaceBlockedReasonCount: input.marketplaceBlockedReasonCount,
    partialUpdateSurfaceIds: Object.freeze([
      ...(input.partialUpdateSurfaceIds ?? []),
    ]),
    primaryStatus: input.primaryStatus,
    ready: input.ready,
    statuses: snapshotCanvasAppFeaturePackMarketplacePackageStatuses(
      input.statuses,
    ),
    totalBlockedReasonCount,
  })
}

export function getCanvasAppFeaturePackMarketplacePackPackageStatuses({
  actionStatus,
  enabled,
  installed,
  runtimeStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  enabled: boolean
  installed: boolean
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return snapshotCanvasAppFeaturePackMarketplacePackageStatuses([
    ...getCanvasAppFeaturePackMarketplaceInstallStatuses({
      enabled,
      installed,
    }),
    ...getCanvasAppFeaturePackMarketplaceRuntimeStatuses(runtimeStatus),
    ...getCanvasAppFeaturePackMarketplaceBlockedStatuses({
      actionStatus,
      totalBlockedReasonCount,
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplacePackPackagePrimaryStatus({
  actionStatus,
  enabled,
  installed,
  runtimeStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  enabled: boolean
  installed: boolean
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus
  totalBlockedReasonCount: number
}): CanvasAppFeaturePackMarketplacePackageStatus {
  const runtimePrimaryStatus =
    getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(runtimeStatus)

  if (runtimePrimaryStatus) {
    return runtimePrimaryStatus
  }

  if (
    !installed &&
    actionStatus === 'blocked' &&
    totalBlockedReasonCount > 0
  ) {
    return 'blocked'
  }

  if (enabled) {
    return 'enabled'
  }

  if (installed) {
    return 'disabled'
  }

  return 'available'
}

export function getCanvasAppFeaturePackMarketplaceSuitePackageStatuses({
  actionStatus,
  status,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  status: 'disabled' | 'enabled' | 'partial' | 'uninstalled'
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return snapshotCanvasAppFeaturePackMarketplacePackageStatuses([
    ...(status === 'uninstalled' ? ['available' as const] : []),
    ...(status === 'enabled' || status === 'disabled'
      ? ['installed' as const]
      : []),
    ...(status === 'enabled' ? ['enabled' as const] : []),
    ...(status === 'disabled' ? ['disabled' as const] : []),
    ...(status === 'partial' ? ['partial' as const] : []),
    ...getCanvasAppFeaturePackMarketplaceBlockedStatuses({
      actionStatus,
      totalBlockedReasonCount,
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplaceSuitePackagePrimaryStatus({
  actionStatus,
  status,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  status: 'disabled' | 'enabled' | 'partial' | 'uninstalled'
  totalBlockedReasonCount: number
}): CanvasAppFeaturePackMarketplacePackageStatus {
  if (
    status === 'uninstalled' &&
    actionStatus === 'blocked' &&
    totalBlockedReasonCount > 0
  ) {
    return 'blocked'
  }

  if (status === 'uninstalled') {
    return 'available'
  }

  return status
}

export function getCanvasAppFeaturePackMarketplaceProfilePackageStatuses({
  status,
}: {
  status: 'active' | 'blocked' | 'ready'
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  if (status === 'active') {
    return Object.freeze(['active', 'installed', 'enabled'])
  }

  if (status === 'ready') {
    return Object.freeze(['available', 'ready'])
  }

  return Object.freeze(['available', 'blocked'])
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

function getCanvasAppFeaturePackMarketplaceInstallStatuses({
  enabled,
  installed,
}: {
  enabled: boolean
  installed: boolean
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  if (!installed) {
    return Object.freeze(['available'])
  }

  return Object.freeze([
    'installed',
    enabled ? 'enabled' : 'disabled',
  ])
}

function getCanvasAppFeaturePackMarketplaceRuntimeStatuses(
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus,
): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  const primaryStatus =
    getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(runtimeStatus)

  return primaryStatus ? Object.freeze([primaryStatus]) : Object.freeze([])
}

function getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus,
): CanvasAppFeaturePackMarketplacePackageStatus | null {
  if (
    runtimeStatus === 'activation-failed' ||
    runtimeStatus === 'partially-updated' ||
    runtimeStatus === 'rollback-available' ||
    runtimeStatus === 'updating'
  ) {
    return runtimeStatus
  }

  return null
}

function getCanvasAppFeaturePackMarketplaceBlockedStatuses({
  actionStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return actionStatus === 'blocked' && totalBlockedReasonCount > 0
    ? Object.freeze(['blocked'])
    : Object.freeze([])
}

function snapshotCanvasAppFeaturePackMarketplacePackageStatuses(
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[],
): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return Object.freeze([...new Set(statuses)])
}
