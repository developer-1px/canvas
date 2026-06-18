import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  createCanvasAppFeaturePackExtensionBundle,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  assertCanvasAppFeaturePackViewRenderers,
  createCanvasAppFeaturePackViewRenderers,
  getCanvasAppFeaturePackProfileById,
  getCanvasAppFeaturePackProfileRuntimeStates,
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppManifestExtensionFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppFeaturePackMarketplaceModel,
  getCanvasAppResolvedFeaturePackStates,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackManifestOrphanedDataScopeId,
  type CanvasAppFeaturePackRuntimeStateInput,
  type CanvasAppFeaturePackSuiteManifest,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppViewFeaturePack,
} from '../feature-packs'
import type {
  CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'

export type CanvasAppFeaturePackAssembly = {
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackExtensionBundle: CanvasAppExtensionBundle
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackViewRenderers: CanvasAppFeaturePackViewRenderers
}

export type CanvasAppFeaturePackAssemblyInput = {
  additionalFeaturePackManifests?: readonly CanvasAppFeaturePackManifest[]
  disabledFeaturePackIds?: CanvasAppFeaturePackInstallOptions[
    'disabledFeaturePackIds'
  ]
  disabledViewFeaturePackIds?: CanvasAppFeaturePackInstallOptions[
    'disabledFeaturePackIds'
  ]
  featurePackStates?: CanvasAppFeaturePackInstallOptions['featurePackStates']
  featurePackManifests?: readonly CanvasAppFeaturePackManifest[]
  featurePackProfile?: CanvasAppFeaturePackProfile
  featurePackProfileId?: CanvasAppFeaturePackProfileId
  featurePackProfiles?: readonly CanvasAppFeaturePackProfile[]
  featurePackViewRenderers?: CanvasAppFeaturePackViewRenderers
  viewFeaturePacks?: readonly CanvasAppViewFeaturePack[]
}

export type CanvasAppFeaturePackMarketplaceActionAssemblyInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
}>

export type CanvasAppFeaturePackMarketplaceActionAssemblyPlan =
  | CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan
  | CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan

export type CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    assemblyInput: CanvasAppFeaturePackAssemblyInput
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'ready'
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export type CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    blockedReasonCount: number
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    marketplaceBlockedReasonCount: number
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'blocked'
    totalBlockedReasonCount: number
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan =
  Readonly<{
    entries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
    hostManagedFeaturePackIds: readonly CanvasAppFeaturePackId[]
    hostManagedScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    preserveFeaturePackIds: readonly CanvasAppFeaturePackId[]
    preserveScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    removeFeaturePackIds: readonly CanvasAppFeaturePackId[]
    removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    unscopedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyModelInput = Readonly<{
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyModel = Readonly<{
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
  installOptions: CanvasAppFeaturePackInstallOptions
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  marketplaceModel: CanvasAppFeaturePackMarketplaceModel
  profiles: readonly CanvasAppFeaturePackProfile[]
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyActionInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode =
  | 'blocked'
  | 'full-rebuild'
  | 'partial-update'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyPlan =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan & Readonly<{
    updateMode: Exclude<
      CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
      'blocked'
    >
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan & Readonly<{
    updateMode: 'blocked'
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyResult =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult =
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan & Readonly<{
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
    nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult =
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan & Readonly<{
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  }>

export function createCanvasAppFeaturePackAssembly(
  input: CanvasAppFeaturePackAssemblyInput,
  defaults: CanvasAppFeaturePackAssembly,
): CanvasAppFeaturePackAssembly {
  if (input.featurePackViewRenderers) {
    assertCanvasAppFeaturePackViewRenderers(input.featurePackViewRenderers)
    const featurePackManifests =
      getCanvasAppAssemblyFeaturePackManifests(input)
    const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
      input,
      featurePackManifests,
    )

    return {
      enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackExtensionBundle: createCanvasAppFeaturePackExtensionBundle(
        getCanvasAppManifestExtensionFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
      installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackViewRenderers: snapshotCanvasAppFeaturePackViewRenderers(
        input.featurePackViewRenderers,
      ),
    }
  }

  if (
    input.featurePackManifests ||
    input.additionalFeaturePackManifests ||
    input.disabledFeaturePackIds ||
    input.featurePackProfile ||
    input.featurePackProfileId ||
    input.featurePackStates
  ) {
    const featurePackManifests =
      getCanvasAppAssemblyFeaturePackManifests(input)
    const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
      input,
      featurePackManifests,
    )

    return {
      enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackExtensionBundle: createCanvasAppFeaturePackExtensionBundle(
        getCanvasAppManifestExtensionFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
      installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackViewRenderers: createCanvasAppFeaturePackViewRenderers(
        getCanvasAppManifestViewFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
    }
  }

  if (input.viewFeaturePacks || input.disabledViewFeaturePackIds) {
    return {
      enabledFeaturePackIds: defaults.enabledFeaturePackIds,
      featurePackExtensionBundle: defaults.featurePackExtensionBundle,
      installedFeaturePackIds: defaults.installedFeaturePackIds,
      featurePackViewRenderers: createCanvasAppFeaturePackViewRenderers(
        input.viewFeaturePacks ?? DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
        {
          disabledFeaturePackIds: input.disabledViewFeaturePackIds,
        },
      ),
    }
  }

  return defaults
}

export function getCanvasAppFeaturePackMarketplaceAssemblyModel({
  assemblyInput = {},
  listings = [],
  profiles,
  suiteManifests,
}: CanvasAppFeaturePackMarketplaceAssemblyModelInput = {}):
  CanvasAppFeaturePackMarketplaceAssemblyModel {
  const featurePackManifests = snapshotCanvasAppFeaturePackManifests(
    getCanvasAppAssemblyFeaturePackManifests(assemblyInput),
  )
  const installOptions =
    getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
      assemblyInput,
      featurePackManifests,
    })
  const canonicalAssemblyInput =
    getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
      assemblyInput,
      installOptions,
    })
  const marketplaceListings =
    snapshotCanvasAppFeaturePackMarketplaceListings(listings)
  const marketplaceProfiles = snapshotCanvasAppFeaturePackProfiles(
    profiles ?? assemblyInput.featurePackProfiles ??
      DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  )
  const marketplaceSuiteManifests = snapshotCanvasAppFeaturePackSuiteManifests(
    suiteManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  )

  return Object.freeze({
    assemblyInput: canonicalAssemblyInput,
    featurePackManifests,
    installOptions,
    listings: marketplaceListings,
    marketplaceModel: getCanvasAppFeaturePackMarketplaceModel({
      listings: marketplaceListings,
      manifests: featurePackManifests,
      options: installOptions,
      profiles: marketplaceProfiles,
      suiteManifests: marketplaceSuiteManifests,
    }),
    profiles: marketplaceProfiles,
    suiteManifests: marketplaceSuiteManifests,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyResult(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyResult {
  const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(input)

  if (applyPlan.status === 'blocked') {
    return Object.freeze({
      ...applyPlan,
      currentModel: input.model,
    })
  }

  return Object.freeze({
    ...applyPlan,
    currentModel: input.model,
    nextModel: getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: applyPlan.assemblyInput,
      listings: input.model.listings,
      profiles: input.model.profiles,
      suiteManifests: input.model.suiteManifests,
    }),
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyPlan {
  const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan(input)

  if (actionPlan.status === 'blocked') {
    return Object.freeze({
      ...actionPlan,
      updateMode: 'blocked',
    })
  }

  return Object.freeze({
    ...actionPlan,
    updateMode: actionPlan.partialUpdateSurfaceIds.length > 0
      ? 'partial-update'
      : 'full-rebuild',
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  const plan = getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput,
  })

  if (plan.status !== 'ready') {
    throw new Error(
      `Canvas app feature pack marketplace action is not ready: ${action.kind}`,
    )
  }

  return plan.assemblyInput
}

export function getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  const uninstallDataPlan =
    getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
      action.uninstallPolicyEntries,
    )

  if (!action.ready) {
    const blockedReasonCount = action.blockedReasons.length
    const marketplaceBlockedReasonCount = action.marketplaceBlockedReasons.length

    return Object.freeze({
      action,
      actionKind: action.kind,
      blockedReasonCount,
      changedFeaturePackIds: action.changedFeaturePackIds,
      marketplaceBlockedReasonCount,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      status: 'blocked',
      totalBlockedReasonCount:
        blockedReasonCount + marketplaceBlockedReasonCount,
      uninstallDataPlan,
      uninstallPolicyEntries: action.uninstallPolicyEntries,
    })
  }

  return Object.freeze({
    action,
    actionKind: action.kind,
    assemblyInput: getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
      action,
      assemblyInput,
    }),
    changedFeaturePackIds: action.changedFeaturePackIds,
    partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
    status: 'ready',
    uninstallDataPlan,
    uninstallPolicyEntries: action.uninstallPolicyEntries,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
  entries: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'],
): CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan {
  const hostManagedFeaturePackIds: CanvasAppFeaturePackId[] = []
  const hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const preserveFeaturePackIds: CanvasAppFeaturePackId[] = []
  const preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const removeFeaturePackIds: CanvasAppFeaturePackId[] = []
  const removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const unscopedFeaturePackIds: CanvasAppFeaturePackId[] = []

  for (const entry of entries) {
    const featurePackIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
      entry,
      hostManagedFeaturePackIds,
      preserveFeaturePackIds,
      removeFeaturePackIds,
    })
    const scopeIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
      entry,
      hostManagedScopeIds,
      preserveScopeIds,
      removeScopeIds,
    })

    appendCanvasAppFeaturePackMarketplaceUniqueId(
      featurePackIds,
      entry.featurePackId,
    )

    if (entry.orphanedDataScopeIds.length === 0) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(
        unscopedFeaturePackIds,
        entry.featurePackId,
      )
      continue
    }

    for (const scopeId of entry.orphanedDataScopeIds) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(scopeIds, scopeId)
    }
  }

  return Object.freeze({
    entries: Object.freeze([...entries]),
    hostManagedFeaturePackIds: Object.freeze(hostManagedFeaturePackIds),
    hostManagedScopeIds: Object.freeze(hostManagedScopeIds),
    preserveFeaturePackIds: Object.freeze(preserveFeaturePackIds),
    preserveScopeIds: Object.freeze(preserveScopeIds),
    removeFeaturePackIds: Object.freeze(removeFeaturePackIds),
    removeScopeIds: Object.freeze(removeScopeIds),
    unscopedFeaturePackIds: Object.freeze(unscopedFeaturePackIds),
  })
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
  entry,
  hostManagedFeaturePackIds,
  preserveFeaturePackIds,
  removeFeaturePackIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedFeaturePackIds: CanvasAppFeaturePackId[]
  preserveFeaturePackIds: CanvasAppFeaturePackId[]
  removeFeaturePackIds: CanvasAppFeaturePackId[]
}): CanvasAppFeaturePackId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedFeaturePackIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeFeaturePackIds
  }

  return preserveFeaturePackIds
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
  entry,
  hostManagedScopeIds,
  preserveScopeIds,
  removeScopeIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}): CanvasAppFeaturePackManifestOrphanedDataScopeId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedScopeIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeScopeIds
  }

  return preserveScopeIds
}

function appendCanvasAppFeaturePackMarketplaceUniqueId<TId extends string>(
  ids: TId[],
  id: TId,
) {
  if (!ids.includes(id)) {
    ids.push(id)
  }
}

function getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
    assemblyInput,
    installOptions: action.installOptions,
  })
}

function getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
  assemblyInput,
  installOptions,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  installOptions: CanvasAppFeaturePackInstallOptions
}): CanvasAppFeaturePackAssemblyInput {
  const canonicalAssemblyInput: CanvasAppFeaturePackAssemblyInput = {
    ...assemblyInput,
  }

  delete canonicalAssemblyInput.disabledFeaturePackIds
  delete canonicalAssemblyInput.featurePackProfile
  delete canonicalAssemblyInput.featurePackProfileId

  return Object.freeze({
    ...canonicalAssemblyInput,
    featurePackStates: installOptions.featurePackStates,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
  assemblyInput,
  featurePackManifests,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
}): CanvasAppFeaturePackInstallOptions {
  const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
    assemblyInput,
    featurePackManifests,
  )

  return Object.freeze({
    featurePackStates: snapshotCanvasAppFeaturePackRuntimeStateInputs(
      getCanvasAppResolvedFeaturePackStates(
        featurePackManifests.map((manifest) => manifest.id),
        installOptions,
      ).map((state) => ({
        id: state.id,
        status: state.status,
      })),
    ),
  })
}

function getCanvasAppAssemblyFeaturePackManifests(
  input: CanvasAppFeaturePackAssemblyInput,
): readonly CanvasAppFeaturePackManifest[] {
  const baseFeaturePackManifests =
    input.featurePackManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS
  const additionalFeaturePackManifests =
    input.additionalFeaturePackManifests ?? []

  if (additionalFeaturePackManifests.length === 0) {
    return baseFeaturePackManifests
  }

  return Object.freeze([
    ...baseFeaturePackManifests,
    ...additionalFeaturePackManifests,
  ])
}

function getCanvasAppAssemblyFeaturePackInstallOptions(
  input: CanvasAppFeaturePackAssemblyInput,
  featurePackManifests: readonly CanvasAppFeaturePackManifest[],
): CanvasAppFeaturePackInstallOptions {
  const profile = getCanvasAppAssemblyFeaturePackProfile(input)

  if (!profile) {
    return {
      disabledFeaturePackIds: input.disabledFeaturePackIds,
      featurePackStates: input.featurePackStates,
    }
  }

  return {
    featurePackStates: [
      ...getCanvasAppFeaturePackProfileRuntimeStates({
        featurePackIds: featurePackManifests.map((manifest) => manifest.id),
        profile,
      }),
      ...(input.disabledFeaturePackIds ?? []).map((id) => ({
        id,
        status: 'uninstalled' as const,
      })),
      ...(input.featurePackStates ?? []),
    ],
  }
}

function getCanvasAppAssemblyFeaturePackProfile(
  input: CanvasAppFeaturePackAssemblyInput,
): CanvasAppFeaturePackProfile | undefined {
  if (input.featurePackProfile && input.featurePackProfileId) {
    throw new Error(
      'Canvas app assembly accepts featurePackProfile or featurePackProfileId, not both',
    )
  }

  if (input.featurePackProfile) {
    return input.featurePackProfile
  }

  if (!input.featurePackProfileId) {
    return undefined
  }

  return getCanvasAppFeaturePackProfileById(
    input.featurePackProfiles ?? DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
    input.featurePackProfileId,
  )
}

function snapshotCanvasAppFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
): readonly CanvasAppFeaturePackManifest[] {
  return Object.freeze([...manifests])
}

function snapshotCanvasAppFeaturePackRuntimeStateInputs(
  states: readonly CanvasAppFeaturePackRuntimeStateInput[],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return Object.freeze(states.map((state) =>
    Object.freeze({
      id: state.id,
      status: state.status,
    })
  ))
}

function snapshotCanvasAppFeaturePackMarketplaceListings(
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[],
): readonly CanvasAppFeaturePackMarketplaceListingInput[] {
  return Object.freeze([...listings])
}

function snapshotCanvasAppFeaturePackProfiles(
  profiles: readonly CanvasAppFeaturePackProfile[],
): readonly CanvasAppFeaturePackProfile[] {
  return Object.freeze([...profiles])
}

function snapshotCanvasAppFeaturePackSuiteManifests(
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[],
): readonly CanvasAppFeaturePackSuiteManifest[] {
  return Object.freeze([...suiteManifests])
}

export function snapshotCanvasAppInstalledFeaturePackIds(
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...installedFeaturePackIds])
}

export function snapshotCanvasAppEnabledFeaturePackIds(
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...enabledFeaturePackIds])
}

export function snapshotCanvasAppFeaturePackViewRenderers(
  renderers: CanvasAppFeaturePackViewRenderers,
): CanvasAppFeaturePackViewRenderers {
  assertCanvasAppFeaturePackViewRenderers(renderers)

  return Object.freeze({ ...renderers })
}
