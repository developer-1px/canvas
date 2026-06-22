import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  createCanvasAppFeaturePackMarketplacePackageState,
  createCanvasAppFeaturePackMarketplaceProfilePackageContract,
  getCanvasAppFeaturePackMarketplaceProfilePackageStatuses,
} from './CanvasAppFeaturePackMarketplacePackages'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  assertCanvasAppFeaturePackProfiles,
  type CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackProfileMarketplaceEnabledFeaturePackIds,
  getCanvasAppFeaturePackProfileMarketplaceGraphReasons,
  getCanvasAppFeaturePackProfileMarketplaceInstalledFeaturePackIds,
  getCanvasAppFeaturePackProfileMarketplaceLifecycleReasons,
  getCanvasAppFeaturePackProfileMarketplaceListingBlockedReasons,
  getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds,
  getCanvasAppFeaturePackProfileMarketplacePartialUpdateFeaturePackIds,
  getCanvasAppFeaturePackProfileMarketplacePartialUpdateReasons,
  getCanvasAppFeaturePackProfileMarketplacePartialUpdateSurfaceIds,
  getCanvasAppFeaturePackProfileMarketplaceStatus,
  getCanvasAppFeaturePackProfileMarketplaceUnknownPackReasons,
  getCanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntries,
} from './CanvasAppFeaturePackProfileActionReasons'
import type {
  CanvasAppFeaturePackProfileMarketplaceAction,
  CanvasAppFeaturePackProfileMarketplaceActionItem,
  CanvasAppFeaturePackProfileMarketplaceActionModel,
  CanvasAppFeaturePackProfileMarketplaceContext,
} from './CanvasAppFeaturePackProfileActionContracts'
import {
  createCanvasAppFeaturePackProfileMarketplaceTargetStates,
  getCanvasAppFeaturePackProfileMarketplaceStateChanges,
} from './CanvasAppFeaturePackProfileActionHelpers'
export type {
  CanvasAppFeaturePackProfileMarketplaceAction,
  CanvasAppFeaturePackProfileMarketplaceActionItem,
  CanvasAppFeaturePackProfileMarketplaceActionKind,
  CanvasAppFeaturePackProfileMarketplaceActionModel,
  CanvasAppFeaturePackProfileMarketplaceBlockScope,
  CanvasAppFeaturePackProfileMarketplaceBlockedReason,
  CanvasAppFeaturePackProfileMarketplaceConflictReason,
  CanvasAppFeaturePackProfileMarketplaceConflictReasonKind,
  CanvasAppFeaturePackProfileMarketplaceLifecycleReason,
  CanvasAppFeaturePackProfileMarketplacePartialUpdateReason,
  CanvasAppFeaturePackProfileMarketplaceRequiredReason,
  CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind,
  CanvasAppFeaturePackProfileMarketplaceStateChange,
  CanvasAppFeaturePackProfileMarketplaceStatus,
  CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry,
  CanvasAppFeaturePackProfileMarketplaceUnknownPackReason,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplaceActionModel({
  listings = [],
  manifests,
  options = {},
  profiles = DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  profiles?: readonly CanvasAppFeaturePackProfile[]
}): CanvasAppFeaturePackProfileMarketplaceActionModel {
  assertCanvasAppFeaturePackManifests(manifests)
  assertCanvasAppFeaturePackProfiles(profiles)

  const currentStates = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    options,
  )
  const manifestById = new Map(manifests.map((manifest) => [
    manifest.id,
    manifest,
  ]))
  const listingById = getCanvasAppFeaturePackMarketplaceListingMap({
    listings,
    manifests,
  })

  return Object.freeze({
    items: Object.freeze(profiles.map((profile) =>
      createCanvasAppFeaturePackProfileMarketplaceActionItem({
        currentStates,
        listingById,
        manifestById,
        manifests,
        options,
        profile,
      }),
    )),
  })
}

function createCanvasAppFeaturePackProfileMarketplaceActionItem({
  currentStates,
  listingById,
  manifestById,
  manifests,
  options,
  profile,
}: {
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  listingById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackMarketplaceListing
  >
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
  profile: CanvasAppFeaturePackProfile
}): CanvasAppFeaturePackProfileMarketplaceActionItem {
  const targetFeaturePackStates =
    createCanvasAppFeaturePackProfileMarketplaceTargetStates({
      featurePackIds: manifests.map((manifest) => manifest.id),
      profile,
    })
  const targetStates = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    {
      featurePackStates: targetFeaturePackStates,
    },
  )
  const context = Object.freeze({
    currentStateById: new Map(currentStates.map((state) => [state.id, state])),
    currentStates,
    manifestById,
    manifests,
    profile,
    targetStateById: new Map(targetStates.map((state) => [state.id, state])),
    targetStates,
  }) satisfies CanvasAppFeaturePackProfileMarketplaceContext
  const stateChanges =
    getCanvasAppFeaturePackProfileMarketplaceStateChanges(context)
  const changedFeaturePackIds = Object.freeze(
    stateChanges.map((change) => change.id),
  )
  const partialUpdateFeaturePackIds =
    getCanvasAppFeaturePackProfileMarketplacePartialUpdateFeaturePackIds(
      stateChanges,
    )
  const partialUpdateSurfaceIds =
    getCanvasAppFeaturePackProfileMarketplacePartialUpdateSurfaceIds({
      context,
      ids: partialUpdateFeaturePackIds,
    })
  const runtimeStatePatch = applyCanvasAppFeaturePackRuntimeStatePatch({
    featurePackIds: manifests.map((manifest) => manifest.id),
    featurePackStates: targetFeaturePackStates,
    options,
  })
  const blockedReasons = Object.freeze([
    ...getCanvasAppFeaturePackProfileMarketplaceUnknownPackReasons(context),
    ...getCanvasAppFeaturePackProfileMarketplaceLifecycleReasons({
      context,
      stateChanges,
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceGraphReasons(context),
    ...getCanvasAppFeaturePackProfileMarketplacePartialUpdateReasons({
      context,
      ids: partialUpdateFeaturePackIds,
    }),
  ])
  const marketplaceBlockedReasons =
    getCanvasAppFeaturePackProfileMarketplaceListingBlockedReasons({
      listingById,
      stateChanges,
    })
  const status = getCanvasAppFeaturePackProfileMarketplaceStatus({
    blockedReasons,
    marketplaceBlockedReasons,
    stateChanges,
  })
  const action = Object.freeze({
    applicable: stateChanges.length > 0,
    blockedReasons,
    changedFeaturePackIds,
    featurePackStates: targetFeaturePackStates,
    installOptions: runtimeStatePatch.options,
    kind: 'apply',
    marketplaceBlockedReasons,
    partialUpdateSurfaceIds,
    ready: status === 'ready',
    stateChanges,
    status,
    uninstallPolicyEntries:
      getCanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntries({
        context,
        stateChanges,
      }),
  } satisfies CanvasAppFeaturePackProfileMarketplaceAction)

  return Object.freeze({
    actions: Object.freeze([action]),
    active: status === 'active',
    currentEnabledFeaturePackIds:
      getCanvasAppFeaturePackProfileMarketplaceEnabledFeaturePackIds(
        currentStates,
      ),
    currentInstalledFeaturePackIds:
      getCanvasAppFeaturePackProfileMarketplaceInstalledFeaturePackIds(
        currentStates,
      ),
    label: profile.label,
    missingFeaturePackIds:
      getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds({
        manifestById,
        profile,
      }),
    packageContract:
      createCanvasAppFeaturePackMarketplaceProfilePackageContract({
        currentStates,
        manifests,
        profile,
      }),
    packageState: createCanvasAppFeaturePackMarketplacePackageState({
      actionKind: action.kind,
      actionStatus: action.status,
      active: status === 'active',
      blockedReasonCount: action.blockedReasons.length,
      enabled: status === 'active',
      id: profile.id,
      installed: status === 'active',
      kind: 'profile',
      marketplaceBlockedReasonCount: action.marketplaceBlockedReasons.length,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      primaryStatus: status,
      ready: action.ready,
      statuses: getCanvasAppFeaturePackMarketplaceProfilePackageStatuses({
        status,
      }),
    }),
    primaryActionKind: 'apply',
    profile,
    profileId: profile.id,
    status,
    targetEnabledFeaturePackIds: profile.enabledFeaturePackIds,
    targetInstalledFeaturePackIds: profile.installedFeaturePackIds,
  })
}
