import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
  type CanvasAppFeaturePackManifestOrphanedDataScopeId,
  type CanvasAppFeaturePackManifestOrphanedDataPolicy,
} from './CanvasAppFeaturePackManifests'
import {
  getCanvasAppFeaturePackMarketplaceListingBlockedReasons,
  getCanvasAppFeaturePackMarketplaceListingMap,
  type CanvasAppFeaturePackMarketplaceListing,
  type CanvasAppFeaturePackMarketplaceListingBlockedReason,
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  createCanvasAppFeaturePackMarketplacePackageState,
  createCanvasAppFeaturePackMarketplaceProfilePackageContract,
  getCanvasAppFeaturePackMarketplaceProfilePackageStatuses,
  type CanvasAppFeaturePackMarketplacePackageState,
  type CanvasAppFeaturePackMarketplaceProfilePackageContract,
} from './CanvasAppFeaturePackMarketplacePackages'
import {
  getCanvasAppFeaturePackPartialUpdatePlan,
  type CanvasAppFeaturePackPartialUpdatePlanBlockedReason,
} from './CanvasAppFeaturePackPartialUpdatePlan'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  assertCanvasAppFeaturePackProfiles,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStateInput,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackProfileMarketplaceActionKind = 'apply'

export type CanvasAppFeaturePackProfileMarketplaceStatus =
  | 'active'
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackProfileMarketplaceActionModel = Readonly<{
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
}>

export type CanvasAppFeaturePackProfileMarketplaceActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackProfileMarketplaceAction[]
  active: boolean
  currentEnabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  currentInstalledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  label: string
  missingFeaturePackIds: readonly CanvasAppFeaturePackId[]
  packageContract: CanvasAppFeaturePackMarketplaceProfilePackageContract
  packageState: CanvasAppFeaturePackMarketplacePackageState
  primaryActionKind: CanvasAppFeaturePackProfileMarketplaceActionKind
  profile: CanvasAppFeaturePackProfile
  profileId: CanvasAppFeaturePackProfileId
  status: CanvasAppFeaturePackProfileMarketplaceStatus
  targetEnabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  targetInstalledFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackProfileMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackProfileMarketplaceBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installOptions: CanvasAppFeaturePackInstallOptions
  kind: CanvasAppFeaturePackProfileMarketplaceActionKind
  marketplaceBlockedReasons:
    readonly CanvasAppFeaturePackMarketplaceListingBlockedReason[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
  status: CanvasAppFeaturePackProfileMarketplaceStatus
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry[]
}>

export type CanvasAppFeaturePackProfileMarketplaceStateChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
}>

export type CanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntry =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    orphanedDataScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    orphanedDataPolicy: CanvasAppFeaturePackManifestOrphanedDataPolicy
  }>

export type CanvasAppFeaturePackProfileMarketplaceBlockScope =
  | 'enabled'
  | 'installed'

export type CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind =
  | 'disabled-required-pack'
  | 'missing-required-pack'
  | 'uninstalled-required-pack'

export type CanvasAppFeaturePackProfileMarketplaceConflictReasonKind =
  | 'enabled-conflict'
  | 'installed-conflict'

export type CanvasAppFeaturePackProfileMarketplaceUnknownPackReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'unknown-profile-pack'
    profileId: CanvasAppFeaturePackProfileId
  }>

export type CanvasAppFeaturePackProfileMarketplaceLifecycleReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind:
      | 'install-unavailable'
      | 'runtime-toggle-unavailable'
      | 'uninstall-unavailable'
    profileId: CanvasAppFeaturePackProfileId
  }>

export type CanvasAppFeaturePackProfileMarketplacePartialUpdateReason =
  Readonly<{
    kind: 'partial-update-blocked'
    profileId: CanvasAppFeaturePackProfileId
    reason: CanvasAppFeaturePackPartialUpdatePlanBlockedReason
  }>

export type CanvasAppFeaturePackProfileMarketplaceRequiredReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind
    profileId: CanvasAppFeaturePackProfileId
    requiredId: CanvasAppFeaturePackId
    scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
  }>

export type CanvasAppFeaturePackProfileMarketplaceConflictReason =
  Readonly<{
    conflictId: CanvasAppFeaturePackId
    featurePackId: CanvasAppFeaturePackId
    kind: CanvasAppFeaturePackProfileMarketplaceConflictReasonKind
    profileId: CanvasAppFeaturePackProfileId
    scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
  }>

export type CanvasAppFeaturePackProfileMarketplaceBlockedReason =
  | CanvasAppFeaturePackProfileMarketplaceConflictReason
  | CanvasAppFeaturePackProfileMarketplaceLifecycleReason
  | CanvasAppFeaturePackProfileMarketplacePartialUpdateReason
  | CanvasAppFeaturePackProfileMarketplaceRequiredReason
  | CanvasAppFeaturePackProfileMarketplaceUnknownPackReason

type CanvasAppFeaturePackProfileMarketplaceContext = Readonly<{
  currentStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
  profile: CanvasAppFeaturePackProfile
  targetStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  targetStates: readonly CanvasAppFeaturePackRuntimeState[]
}>

type CanvasAppFeaturePackProfileMarketplaceActiveIdSets = Readonly<{
  enabledIds: ReadonlySet<CanvasAppFeaturePackId>
  installedIds: ReadonlySet<CanvasAppFeaturePackId>
  knownIds: ReadonlySet<CanvasAppFeaturePackId>
}>

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

function createCanvasAppFeaturePackProfileMarketplaceTargetStates({
  featurePackIds,
  profile,
}: {
  featurePackIds: readonly CanvasAppFeaturePackId[]
  profile: CanvasAppFeaturePackProfile
}): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  const installedIds = new Set(profile.installedFeaturePackIds)
  const enabledIds = new Set(profile.enabledFeaturePackIds)

  return Object.freeze(featurePackIds.map((id) => {
    if (!installedIds.has(id)) {
      return Object.freeze({
        id,
        status: 'uninstalled',
      })
    }

    return Object.freeze({
      id,
      status: enabledIds.has(id) ? 'enabled' : 'disabled',
    })
  }))
}

function getCanvasAppFeaturePackProfileMarketplaceStateChanges(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): readonly CanvasAppFeaturePackProfileMarketplaceStateChange[] {
  return Object.freeze(
    context.targetStates.flatMap((targetState) => {
      const currentState = context.currentStateById.get(targetState.id)

      if (
        !currentState ||
        (
          currentState.enabled === targetState.enabled &&
          currentState.installed === targetState.installed &&
          currentState.status === targetState.status
        )
      ) {
        return []
      }

      return [Object.freeze({
        from: currentState,
        id: targetState.id,
        to: targetState,
      })]
    }),
  )
}

function getCanvasAppFeaturePackProfileMarketplaceUnknownPackReasons(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): readonly CanvasAppFeaturePackProfileMarketplaceUnknownPackReason[] {
  return Object.freeze(
    getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds({
      manifestById: context.manifestById,
      profile: context.profile,
    }).map((featurePackId) =>
      Object.freeze({
        featurePackId,
        kind: 'unknown-profile-pack',
        profileId: context.profile.id,
      }) satisfies CanvasAppFeaturePackProfileMarketplaceUnknownPackReason,
    ),
  )
}

function getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds({
  manifestById,
  profile,
}: {
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  profile: CanvasAppFeaturePackProfile
}): readonly CanvasAppFeaturePackId[] {
  const missingIds: CanvasAppFeaturePackId[] = []
  const seenIds = new Set<CanvasAppFeaturePackId>()

  for (const id of [
    ...profile.installedFeaturePackIds,
    ...profile.enabledFeaturePackIds,
  ]) {
    if (manifestById.has(id) || seenIds.has(id)) {
      continue
    }

    seenIds.add(id)
    missingIds.push(id)
  }

  return Object.freeze(missingIds)
}

function getCanvasAppFeaturePackProfileMarketplaceLifecycleReasons({
  context,
  stateChanges,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
}): readonly CanvasAppFeaturePackProfileMarketplaceLifecycleReason[] {
  return Object.freeze(stateChanges.flatMap((change) => {
    const manifest = context.manifestById.get(change.id)

    if (!manifest) {
      return []
    }

    if (!change.from.installed && change.to.installed) {
      return manifest.lifecycle.installable
        ? []
        : [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
          featurePackId: change.id,
          kind: 'install-unavailable',
          profileId: context.profile.id,
        })]
    }

    if (change.from.installed && !change.to.installed) {
      return manifest.lifecycle.uninstallable
        ? []
        : [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
          featurePackId: change.id,
          kind: 'uninstall-unavailable',
          profileId: context.profile.id,
        })]
    }

    if (
      change.from.installed &&
      change.to.installed &&
      change.from.enabled !== change.to.enabled &&
      !manifest.lifecycle.runtimeToggleable
    ) {
      return [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
        featurePackId: change.id,
        kind: 'runtime-toggle-unavailable',
        profileId: context.profile.id,
      })]
    }

    return []
  }))
}

function createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
  featurePackId,
  kind,
  profileId,
}: {
  featurePackId: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackProfileMarketplaceLifecycleReason['kind']
  profileId: CanvasAppFeaturePackProfileId
}): CanvasAppFeaturePackProfileMarketplaceLifecycleReason {
  return Object.freeze({
    featurePackId,
    kind,
    profileId,
  })
}

function getCanvasAppFeaturePackProfileMarketplaceGraphReasons(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): readonly (
  | CanvasAppFeaturePackProfileMarketplaceConflictReason
  | CanvasAppFeaturePackProfileMarketplaceRequiredReason
)[] {
  const activeIdSets =
    createCanvasAppFeaturePackProfileMarketplaceActiveIdSets(context)

  return Object.freeze([
    ...getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
      activeIdSets,
      context,
      scope: 'installed',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
      activeIdSets,
      context,
      scope: 'installed',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
      activeIdSets,
      context,
      scope: 'enabled',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
      activeIdSets,
      context,
      scope: 'enabled',
    }),
  ])
}

function createCanvasAppFeaturePackProfileMarketplaceActiveIdSets(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): CanvasAppFeaturePackProfileMarketplaceActiveIdSets {
  return Object.freeze({
    enabledIds: createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
      context,
      stateKey: 'enabled',
    }),
    installedIds: createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
      context,
      stateKey: 'installed',
    }),
    knownIds: new Set(
      context.manifests.flatMap((manifest) => [
        manifest.id,
        ...manifest.provides,
      ]),
    ),
  })
}

function createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
  context,
  stateKey,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  stateKey: 'enabled' | 'installed'
}) {
  return new Set(
    context.manifests
      .filter((manifest) => context.targetStateById.get(manifest.id)?.[stateKey])
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

function getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
  activeIdSets,
  context,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  context: CanvasAppFeaturePackProfileMarketplaceContext
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): readonly CanvasAppFeaturePackProfileMarketplaceRequiredReason[] {
  const satisfiedIds = scope === 'enabled'
    ? activeIdSets.enabledIds
    : activeIdSets.installedIds

  return Object.freeze(context.manifests.flatMap((manifest) => {
    if (!context.targetStateById.get(manifest.id)?.[scope]) {
      return []
    }

    return manifest.requires.flatMap((requiredId) => {
      if (satisfiedIds.has(requiredId)) {
        return []
      }

      return [Object.freeze({
        featurePackId: manifest.id,
        kind: getCanvasAppFeaturePackProfileMarketplaceRequiredReasonKind({
          activeIdSets,
          requiredId,
          scope,
        }),
        profileId: context.profile.id,
        requiredId,
        scope,
      })]
    })
  }))
}

function getCanvasAppFeaturePackProfileMarketplaceRequiredReasonKind({
  activeIdSets,
  requiredId,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  requiredId: CanvasAppFeaturePackId
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind {
  if (!activeIdSets.knownIds.has(requiredId)) {
    return 'missing-required-pack'
  }

  if (scope === 'enabled' && activeIdSets.installedIds.has(requiredId)) {
    return 'disabled-required-pack'
  }

  return 'uninstalled-required-pack'
}

function getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
  activeIdSets,
  context,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  context: CanvasAppFeaturePackProfileMarketplaceContext
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): readonly CanvasAppFeaturePackProfileMarketplaceConflictReason[] {
  const activeIds = scope === 'enabled'
    ? activeIdSets.enabledIds
    : activeIdSets.installedIds

  return Object.freeze(context.manifests.flatMap((manifest) => {
    if (!context.targetStateById.get(manifest.id)?.[scope]) {
      return []
    }

    return manifest.conflicts.flatMap((conflictId) => {
      if (!activeIds.has(conflictId)) {
        return []
      }

      return [Object.freeze({
        conflictId,
        featurePackId: manifest.id,
        kind: scope === 'enabled' ? 'enabled-conflict' : 'installed-conflict',
        profileId: context.profile.id,
        scope,
      })]
    })
  }))
}

function getCanvasAppFeaturePackProfileMarketplacePartialUpdateFeaturePackIds(
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    stateChanges
      .filter((change) => change.from.installed && change.to.installed)
      .map((change) => change.id),
  )
}

function getCanvasAppFeaturePackProfileMarketplacePartialUpdateReasons({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  ids: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackProfileMarketplacePartialUpdateReason[] {
  if (ids.length === 0) {
    return []
  }

  const partialUpdatePlan = getCanvasAppFeaturePackPartialUpdatePlan({
    manifests: context.manifests,
    targetFeaturePackIds: ids,
  })

  return Object.freeze(partialUpdatePlan.blockedReasons.map((reason) =>
    Object.freeze({
      kind: 'partial-update-blocked',
      profileId: context.profile.id,
      reason,
    }) satisfies CanvasAppFeaturePackProfileMarketplacePartialUpdateReason,
  ))
}

function getCanvasAppFeaturePackProfileMarketplacePartialUpdateSurfaceIds({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  ids: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackContributionSurface[] {
  if (ids.length === 0) {
    return Object.freeze([])
  }

  return getCanvasAppFeaturePackPartialUpdatePlan({
    manifests: context.manifests,
    targetFeaturePackIds: ids,
  }).surfaceIds
}

function getCanvasAppFeaturePackProfileMarketplaceUninstallPolicyEntries({
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

function getCanvasAppFeaturePackProfileMarketplaceStatus({
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

function getCanvasAppFeaturePackProfileMarketplaceListingBlockedReasons({
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

function isCanvasAppFeaturePackProfileMarketplaceListingBlockedChange(
  stateChange: CanvasAppFeaturePackProfileMarketplaceStateChange,
) {
  return (
    stateChange.to.installed && !stateChange.from.installed
  ) || (
    stateChange.to.enabled && !stateChange.from.enabled
  )
}

function getCanvasAppFeaturePackProfileMarketplaceInstalledFeaturePackIds(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    states.filter((state) => state.installed).map((state) => state.id),
  )
}

function getCanvasAppFeaturePackProfileMarketplaceEnabledFeaturePackIds(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    states.filter((state) => state.enabled).map((state) => state.id),
  )
}
