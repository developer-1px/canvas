import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
  type CanvasAppFeaturePackManifestOrphanedDataScopeId,
  type CanvasAppFeaturePackManifestOrphanedDataPolicy,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  type CanvasAppFeaturePackRuntimeStateInput,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackInstallPlan,
  type CanvasAppFeaturePackInstallPlanBlockedReason,
} from './CanvasAppFeaturePackInstallPlan'
import {
  getCanvasAppFeaturePackPartialUpdatePlan,
  type CanvasAppFeaturePackPartialUpdatePlanBlockedReason,
} from './CanvasAppFeaturePackPartialUpdatePlan'

export type CanvasAppFeaturePackStateTransitionOperation =
  | 'disable'
  | 'enable'
  | 'install'
  | 'uninstall'

export type CanvasAppFeaturePackStateTransitionPlanStatus =
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackStateTransitionPlanInput = Readonly<{
  manifests: readonly CanvasAppFeaturePackManifest[]
  operation: CanvasAppFeaturePackStateTransitionOperation
  options?: CanvasAppFeaturePackManifestInstallOptions
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackStateTransitionPlan = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  disableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  enableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installFeaturePackIds: readonly CanvasAppFeaturePackId[]
  operation: CanvasAppFeaturePackStateTransitionOperation
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
  uninstallFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackStateTransitionChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
}>

export type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    orphanedDataScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    orphanedDataPolicy: CanvasAppFeaturePackManifestOrphanedDataPolicy
  }>

export type CanvasAppFeaturePackStateTransitionInstallPlanReason = Readonly<{
  kind: 'install-plan-blocked'
  reason: CanvasAppFeaturePackInstallPlanBlockedReason
}>

export type CanvasAppFeaturePackStateTransitionPartialUpdateReason = Readonly<{
  kind: 'partial-update-blocked'
  reason: CanvasAppFeaturePackPartialUpdatePlanBlockedReason
}>

export type CanvasAppFeaturePackStateTransitionUnknownTargetReason = Readonly<{
  kind: 'unknown-target-pack'
  targetId: CanvasAppFeaturePackId
}>

export type CanvasAppFeaturePackStateTransitionLifecycleReason = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  kind:
    | 'install-unavailable'
    | 'runtime-toggle-unavailable'
    | 'uninstall-unavailable'
}>

export type CanvasAppFeaturePackStateTransitionDependencyReason = Readonly<{
  dependentFeaturePackId: CanvasAppFeaturePackId
  featurePackId: CanvasAppFeaturePackId
  kind: 'required-by-enabled-pack' | 'required-by-installed-pack'
  requiredId: CanvasAppFeaturePackId
}>

export type CanvasAppFeaturePackStateTransitionBlockedReason =
  | CanvasAppFeaturePackStateTransitionDependencyReason
  | CanvasAppFeaturePackStateTransitionInstallPlanReason
  | CanvasAppFeaturePackStateTransitionLifecycleReason
  | CanvasAppFeaturePackStateTransitionPartialUpdateReason
  | CanvasAppFeaturePackStateTransitionUnknownTargetReason

type CanvasAppFeaturePackStateTransitionContext = Readonly<{
  currentStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
}>

export function getCanvasAppFeaturePackStateTransitionPlan(
  input: CanvasAppFeaturePackStateTransitionPlanInput,
): CanvasAppFeaturePackStateTransitionPlan {
  assertCanvasAppFeaturePackManifests(input.manifests)
  assertCanvasAppFeaturePackIds(input.targetFeaturePackIds)

  const operation = input.operation

  if (!isCanvasAppFeaturePackStateTransitionOperation(operation)) {
    throw new Error(
      `Invalid canvas app feature pack state transition operation: ${operation}`,
    )
  }

  const context = createCanvasAppFeaturePackStateTransitionContext(input)
  const transition =
    getCanvasAppFeaturePackStateTransitionTargetStateChanges({
      context,
      input,
    })
  const nextStates = getCanvasAppFeaturePackStateTransitionNextStates({
    context,
    statusById: transition.statusById,
  })
  const stateChanges = getCanvasAppFeaturePackStateTransitionChanges({
    currentStateById: context.currentStateById,
    nextStates,
  })
  const blockedReasons = Object.freeze([
    ...transition.blockedReasons,
    ...getCanvasAppFeaturePackStateTransitionLifecycleBlockedReasons({
      context,
      ids: transition.changedFeaturePackIds,
      operation,
    }),
    ...getCanvasAppFeaturePackStateTransitionDependencyBlockedReasons({
      context,
      operation,
      targetFeaturePackIds: input.targetFeaturePackIds,
    }),
    ...getCanvasAppFeaturePackStateTransitionPartialUpdateBlockedReasons({
      context,
      ids: transition.partialUpdateFeaturePackIds,
    }),
  ])
  const status = blockedReasons.length === 0 ? 'ready' : 'blocked'

  return Object.freeze({
    blockedReasons,
    changedFeaturePackIds: Object.freeze(stateChanges.map((change) => change.id)),
    disableFeaturePackIds: transition.disableFeaturePackIds,
    enableFeaturePackIds: transition.enableFeaturePackIds,
    featurePackStates: Object.freeze(nextStates.map((state) => ({
      id: state.id,
      status: state.status,
    }))),
    installFeaturePackIds: transition.installFeaturePackIds,
    operation,
    partialUpdateSurfaceIds: transition.partialUpdateSurfaceIds,
    ready: status === 'ready',
    stateChanges,
    status,
    targetFeaturePackIds: Object.freeze([...input.targetFeaturePackIds]),
    uninstallPolicyEntries:
      getCanvasAppFeaturePackStateTransitionUninstallPolicyEntries({
        context,
        ids: transition.uninstallFeaturePackIds,
      }),
    uninstallFeaturePackIds: transition.uninstallFeaturePackIds,
  })
}

function createCanvasAppFeaturePackStateTransitionContext(
  input: CanvasAppFeaturePackStateTransitionPlanInput,
): CanvasAppFeaturePackStateTransitionContext {
  const currentStates = getCanvasAppResolvedFeaturePackStates(
    input.manifests.map((manifest) => manifest.id),
    input.options,
  )

  return Object.freeze({
    currentStateById: new Map(currentStates.map((state) => [state.id, state])),
    currentStates,
    manifestById: new Map(input.manifests.map((manifest) => [
      manifest.id,
      manifest,
    ])),
    manifests: input.manifests,
  })
}

function getCanvasAppFeaturePackStateTransitionTargetStateChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}) {
  if (input.operation === 'install' || input.operation === 'enable') {
    return getCanvasAppFeaturePackStateTransitionInstallTargetChanges({
      context,
      input,
    })
  }

  return getCanvasAppFeaturePackStateTransitionDirectTargetChanges({
    context,
    input,
  })
}

function getCanvasAppFeaturePackStateTransitionInstallTargetChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}) {
  const mode = input.operation === 'enable' ? 'enable' : 'install'
  const installPlan = getCanvasAppFeaturePackInstallPlan({
    manifests: context.manifests,
    mode,
    options: input.options,
    targetFeaturePackIds: input.targetFeaturePackIds,
  })
  const statusById = new Map<CanvasAppFeaturePackId, 'disabled' | 'enabled'>()

  for (const id of installPlan.installFeaturePackIds) {
    statusById.set(id, mode === 'enable' ? 'enabled' : 'disabled')
  }

  for (const id of installPlan.enableFeaturePackIds) {
    statusById.set(id, 'enabled')
  }

  return Object.freeze({
    blockedReasons: Object.freeze(installPlan.blockedReasons.map((reason) =>
      Object.freeze({
        kind: 'install-plan-blocked',
        reason,
      }) satisfies CanvasAppFeaturePackStateTransitionInstallPlanReason,
    )),
    changedFeaturePackIds: Object.freeze(Array.from(statusById.keys())),
    disableFeaturePackIds: Object.freeze([]),
    enableFeaturePackIds: installPlan.enableFeaturePackIds,
    installFeaturePackIds: installPlan.installFeaturePackIds,
    partialUpdateFeaturePackIds: mode === 'enable'
      ? installPlan.enableFeaturePackIds
      : Object.freeze([]),
    partialUpdateSurfaceIds: mode === 'enable'
      ? getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
          context,
          ids: installPlan.enableFeaturePackIds,
        })
      : Object.freeze([]),
    statusById,
    uninstallFeaturePackIds: Object.freeze([]),
  })
}

function getCanvasAppFeaturePackStateTransitionDirectTargetChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}) {
  const statusById = new Map<CanvasAppFeaturePackId, 'disabled' | 'uninstalled'>()
  const unknownBlockedReasons:
    CanvasAppFeaturePackStateTransitionUnknownTargetReason[] = []

  for (const targetFeaturePackId of input.targetFeaturePackIds) {
    if (!context.manifestById.has(targetFeaturePackId)) {
      unknownBlockedReasons.push(Object.freeze({
        kind: 'unknown-target-pack',
        targetId: targetFeaturePackId,
      }))
      continue
    }

    const currentState = context.currentStateById.get(targetFeaturePackId)

    if (!currentState?.installed) {
      continue
    }

    if (input.operation === 'disable' && currentState.enabled) {
      statusById.set(targetFeaturePackId, 'disabled')
    }

    if (input.operation === 'uninstall') {
      statusById.set(targetFeaturePackId, 'uninstalled')
    }
  }

  const changedFeaturePackIds = Object.freeze(Array.from(statusById.keys()))

  return Object.freeze({
    blockedReasons: Object.freeze(unknownBlockedReasons),
    changedFeaturePackIds,
    disableFeaturePackIds: input.operation === 'disable'
      ? changedFeaturePackIds
      : Object.freeze([]),
    enableFeaturePackIds: Object.freeze([]),
    installFeaturePackIds: Object.freeze([]),
    partialUpdateFeaturePackIds: input.operation === 'disable'
      ? changedFeaturePackIds
      : Object.freeze([]),
    partialUpdateSurfaceIds: input.operation === 'disable'
      ? getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
          context,
          ids: changedFeaturePackIds,
        })
      : Object.freeze([]),
    statusById,
    uninstallFeaturePackIds: input.operation === 'uninstall'
      ? changedFeaturePackIds
      : Object.freeze([]),
  })
}

function getCanvasAppFeaturePackStateTransitionNextStates({
  context,
  statusById,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  statusById: ReadonlyMap<CanvasAppFeaturePackId, 'disabled' | 'enabled' | 'uninstalled'>
}) {
  return getCanvasAppResolvedFeaturePackStates(
    context.manifests.map((manifest) => manifest.id),
    {
      featurePackStates: context.currentStates.map((state) => ({
        id: state.id,
        status: statusById.get(state.id) ?? state.status,
      })),
    },
  )
}

function getCanvasAppFeaturePackStateTransitionChanges({
  currentStateById,
  nextStates,
}: {
  currentStateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
  nextStates: readonly CanvasAppFeaturePackRuntimeState[]
}) {
  return Object.freeze(
    nextStates.flatMap((nextState) => {
      const currentState = currentStateById.get(nextState.id)

      if (
        !currentState ||
        (
          currentState.enabled === nextState.enabled &&
          currentState.installed === nextState.installed &&
          currentState.status === nextState.status
        )
      ) {
        return []
      }

      return [Object.freeze({
        from: currentState,
        id: nextState.id,
        to: nextState,
      })]
    }),
  )
}

function getCanvasAppFeaturePackStateTransitionLifecycleBlockedReasons({
  context,
  ids,
  operation,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  ids: readonly CanvasAppFeaturePackId[]
  operation: CanvasAppFeaturePackStateTransitionOperation
}): readonly CanvasAppFeaturePackStateTransitionLifecycleReason[] {
  return Object.freeze(ids.flatMap((id) => {
    const manifest = context.manifestById.get(id)

    if (!manifest) {
      return []
    }

    if (operation === 'install' && !manifest.lifecycle.installable) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'install-unavailable',
      })]
    }

    if (
      (operation === 'disable' || operation === 'enable') &&
      !manifest.lifecycle.runtimeToggleable
    ) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'runtime-toggle-unavailable',
      })]
    }

    if (operation === 'uninstall' && !manifest.lifecycle.uninstallable) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'uninstall-unavailable',
      })]
    }

    return []
  }))
}

function createCanvasAppFeaturePackStateTransitionLifecycleReason({
  id,
  kind,
}: {
  id: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackStateTransitionLifecycleReason['kind']
}): CanvasAppFeaturePackStateTransitionLifecycleReason {
  return Object.freeze({
    featurePackId: id,
    kind,
  })
}

function getCanvasAppFeaturePackStateTransitionDependencyBlockedReasons({
  context,
  operation,
  targetFeaturePackIds,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  operation: CanvasAppFeaturePackStateTransitionOperation
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackStateTransitionDependencyReason[] {
  if (operation !== 'disable' && operation !== 'uninstall') {
    return []
  }

  const stateKey = operation === 'disable' ? 'enabled' : 'installed'
  const targetIdSet = new Set(targetFeaturePackIds)
  const targetProvidedIds = createCanvasAppFeaturePackStateTransitionProvidedIdSet(
    context,
    targetIdSet,
  )
  const reasons: CanvasAppFeaturePackStateTransitionDependencyReason[] = []

  for (const manifest of context.manifests) {
    if (targetIdSet.has(manifest.id)) {
      continue
    }

    if (!context.currentStateById.get(manifest.id)?.[stateKey]) {
      continue
    }

    for (const requiredId of manifest.requires) {
      if (!targetProvidedIds.has(requiredId)) {
        continue
      }

      reasons.push(Object.freeze({
        dependentFeaturePackId: manifest.id,
        featurePackId: getCanvasAppFeaturePackStateTransitionProviderFeaturePackId({
          context,
          requiredId,
          targetIdSet,
        }),
        kind: operation === 'disable'
          ? 'required-by-enabled-pack'
          : 'required-by-installed-pack',
        requiredId,
      }))
    }
  }

  return Object.freeze(reasons)
}

function createCanvasAppFeaturePackStateTransitionProvidedIdSet(
  context: CanvasAppFeaturePackStateTransitionContext,
  targetIdSet: ReadonlySet<CanvasAppFeaturePackId>,
) {
  return new Set(
    context.manifests
      .filter((manifest) => targetIdSet.has(manifest.id))
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

function getCanvasAppFeaturePackStateTransitionProviderFeaturePackId({
  context,
  requiredId,
  targetIdSet,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  requiredId: CanvasAppFeaturePackId
  targetIdSet: ReadonlySet<CanvasAppFeaturePackId>
}) {
  if (targetIdSet.has(requiredId)) {
    return requiredId
  }

  const provider = context.manifests.find((manifest) =>
    targetIdSet.has(manifest.id) && manifest.provides.includes(requiredId),
  )

  return provider?.id ?? requiredId
}

function getCanvasAppFeaturePackStateTransitionPartialUpdateBlockedReasons({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  ids: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackStateTransitionPartialUpdateReason[] {
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
      reason,
    }) satisfies CanvasAppFeaturePackStateTransitionPartialUpdateReason,
  ))
}

function getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  ids: readonly CanvasAppFeaturePackId[]
}) {
  if (ids.length === 0) {
    return Object.freeze([])
  }

  return getCanvasAppFeaturePackPartialUpdatePlan({
    manifests: context.manifests,
    targetFeaturePackIds: ids,
  }).surfaceIds
}

function getCanvasAppFeaturePackStateTransitionUninstallPolicyEntries({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  ids: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[] {
  return Object.freeze(ids.flatMap((id) => {
    const manifest = context.manifestById.get(id)

    if (!manifest) {
      return []
    }

    return [Object.freeze({
      featurePackId: id,
      orphanedDataScopeIds: manifest.lifecycle.orphanedDataScopeIds,
      orphanedDataPolicy: manifest.lifecycle.orphanedDataPolicy,
    })]
  }))
}

function isCanvasAppFeaturePackStateTransitionOperation(
  operation: string,
): operation is CanvasAppFeaturePackStateTransitionOperation {
  return (
    operation === 'disable' ||
    operation === 'enable' ||
    operation === 'install' ||
    operation === 'uninstall'
  )
}
