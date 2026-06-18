import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackInstallPlanMode =
  | 'enable'
  | 'install'

export type CanvasAppFeaturePackInstallPlanStatus =
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackInstallPlanInput = Readonly<{
  manifests: readonly CanvasAppFeaturePackManifest[]
  mode?: CanvasAppFeaturePackInstallPlanMode
  options?: CanvasAppFeaturePackManifestInstallOptions
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackInstallPlan = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackInstallPlanBlockedReason[]
  enableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  includedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installFeaturePackIds: readonly CanvasAppFeaturePackId[]
  mode: CanvasAppFeaturePackInstallPlanMode
  ready: boolean
  status: CanvasAppFeaturePackInstallPlanStatus
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackInstallPlanConflictScope =
  | 'enabled'
  | 'installed'

export type CanvasAppFeaturePackInstallPlanMissingRequiredReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'missing-required-pack'
    requiredId: CanvasAppFeaturePackId
  }>

export type CanvasAppFeaturePackInstallPlanUnknownTargetReason =
  Readonly<{
    kind: 'unknown-target-pack'
    targetId: CanvasAppFeaturePackId
  }>

export type CanvasAppFeaturePackInstallPlanConflictReason =
  Readonly<{
    conflictId: CanvasAppFeaturePackId
    featurePackId: CanvasAppFeaturePackId
    kind: 'enabled-conflict' | 'installed-conflict'
    scope: CanvasAppFeaturePackInstallPlanConflictScope
  }>

export type CanvasAppFeaturePackInstallPlanBlockedReason =
  | CanvasAppFeaturePackInstallPlanConflictReason
  | CanvasAppFeaturePackInstallPlanMissingRequiredReason
  | CanvasAppFeaturePackInstallPlanUnknownTargetReason

type CanvasAppFeaturePackInstallPlanGraph = Readonly<{
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
  providersById: ReadonlyMap<
    CanvasAppFeaturePackId,
    readonly CanvasAppFeaturePackManifest[]
  >
  stateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
}>

export function getCanvasAppFeaturePackInstallPlan(
  input: CanvasAppFeaturePackInstallPlanInput,
): CanvasAppFeaturePackInstallPlan {
  assertCanvasAppFeaturePackManifests(input.manifests)
  assertCanvasAppFeaturePackIds(input.targetFeaturePackIds)

  const mode = input.mode ?? 'enable'

  if (mode !== 'enable' && mode !== 'install') {
    throw new Error(`Invalid canvas app feature pack install plan mode: ${mode}`)
  }

  const graph = createCanvasAppFeaturePackInstallPlanGraph({
    manifests: input.manifests,
    options: input.options,
  })
  const blockedReasons: CanvasAppFeaturePackInstallPlanBlockedReason[] = []
  const includedFeaturePackIds =
    getCanvasAppFeaturePackInstallPlanIncludedFeaturePackIds({
      blockedReasons,
      graph,
      mode,
      targetFeaturePackIds: input.targetFeaturePackIds,
    })

  blockedReasons.push(
    ...getCanvasAppFeaturePackInstallPlanConflictReasons({
      graph,
      includedFeaturePackIds,
      mode,
    }),
  )

  return createCanvasAppFeaturePackInstallPlanResult({
    blockedReasons,
    graph,
    includedFeaturePackIds,
    mode,
    targetFeaturePackIds: input.targetFeaturePackIds,
  })
}

function createCanvasAppFeaturePackInstallPlanGraph({
  manifests,
  options,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackInstallPlanGraph {
  const states = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    options,
  )
  const manifestById = new Map(manifests.map((manifest) => [
    manifest.id,
    manifest,
  ]))
  const providersById = new Map<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackManifest[]
  >()

  for (const manifest of manifests) {
    for (const providedId of manifest.provides) {
      providersById.set(providedId, [
        ...(providersById.get(providedId) ?? []),
        manifest,
      ])
    }
  }

  return Object.freeze({
    manifestById,
    manifests,
    providersById,
    stateById: new Map(states.map((state) => [state.id, state])),
  })
}

function getCanvasAppFeaturePackInstallPlanIncludedFeaturePackIds({
  blockedReasons,
  graph,
  mode,
  targetFeaturePackIds,
}: {
  blockedReasons: CanvasAppFeaturePackInstallPlanBlockedReason[]
  graph: CanvasAppFeaturePackInstallPlanGraph
  mode: CanvasAppFeaturePackInstallPlanMode
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackId[] {
  const includedFeaturePackIds: CanvasAppFeaturePackId[] = []
  const visitedIds = new Set<CanvasAppFeaturePackId>()
  const visitingIds = new Set<CanvasAppFeaturePackId>()

  for (const targetFeaturePackId of targetFeaturePackIds) {
    if (!graph.manifestById.has(targetFeaturePackId)) {
      blockedReasons.push(Object.freeze({
        kind: 'unknown-target-pack',
        targetId: targetFeaturePackId,
      }))
      continue
    }

    visitCanvasAppFeaturePackInstallPlanManifest({
      blockedReasons,
      graph,
      includedFeaturePackIds,
      manifestId: targetFeaturePackId,
      mode,
      visitedIds,
      visitingIds,
    })
  }

  return Object.freeze(includedFeaturePackIds)
}

function visitCanvasAppFeaturePackInstallPlanManifest({
  blockedReasons,
  graph,
  includedFeaturePackIds,
  manifestId,
  mode,
  visitedIds,
  visitingIds,
}: {
  blockedReasons: CanvasAppFeaturePackInstallPlanBlockedReason[]
  graph: CanvasAppFeaturePackInstallPlanGraph
  includedFeaturePackIds: CanvasAppFeaturePackId[]
  manifestId: CanvasAppFeaturePackId
  mode: CanvasAppFeaturePackInstallPlanMode
  visitedIds: Set<CanvasAppFeaturePackId>
  visitingIds: Set<CanvasAppFeaturePackId>
}) {
  if (visitedIds.has(manifestId) || visitingIds.has(manifestId)) {
    return
  }

  const manifest = graph.manifestById.get(manifestId)

  if (!manifest) {
    return
  }

  visitingIds.add(manifestId)

  for (const requiredId of manifest.requires) {
    const providerId = getCanvasAppFeaturePackInstallPlanProviderId({
      graph,
      mode,
      requiredId,
    })

    if (!providerId) {
      blockedReasons.push(Object.freeze({
        featurePackId: manifest.id,
        kind: 'missing-required-pack',
        requiredId,
      }))
      continue
    }

    visitCanvasAppFeaturePackInstallPlanManifest({
      blockedReasons,
      graph,
      includedFeaturePackIds,
      manifestId: providerId,
      mode,
      visitedIds,
      visitingIds,
    })
  }

  visitingIds.delete(manifestId)
  visitedIds.add(manifestId)
  includedFeaturePackIds.push(manifestId)
}

function getCanvasAppFeaturePackInstallPlanProviderId({
  graph,
  mode,
  requiredId,
}: {
  graph: CanvasAppFeaturePackInstallPlanGraph
  mode: CanvasAppFeaturePackInstallPlanMode
  requiredId: CanvasAppFeaturePackId
}): CanvasAppFeaturePackId | undefined {
  if (graph.manifestById.has(requiredId)) {
    return requiredId
  }

  const providers = graph.providersById.get(requiredId) ?? []

  if (providers.length === 0) {
    return undefined
  }

  const preferredStateKey = mode === 'enable' ? 'enabled' : 'installed'
  const preferredProvider = providers.find((provider) =>
    graph.stateById.get(provider.id)?.[preferredStateKey],
  )
  const installedProvider = providers.find((provider) =>
    graph.stateById.get(provider.id)?.installed,
  )

  return preferredProvider?.id ?? installedProvider?.id ?? providers[0]?.id
}

function createCanvasAppFeaturePackInstallPlanResult({
  blockedReasons,
  graph,
  includedFeaturePackIds,
  mode,
  targetFeaturePackIds,
}: {
  blockedReasons: readonly CanvasAppFeaturePackInstallPlanBlockedReason[]
  graph: CanvasAppFeaturePackInstallPlanGraph
  includedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  mode: CanvasAppFeaturePackInstallPlanMode
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}): CanvasAppFeaturePackInstallPlan {
  const installFeaturePackIds = includedFeaturePackIds.filter((id) =>
    !graph.stateById.get(id)?.installed,
  )
  const enableFeaturePackIds = mode === 'enable'
    ? includedFeaturePackIds.filter((id) => !graph.stateById.get(id)?.enabled)
    : []
  const status = blockedReasons.length === 0 ? 'ready' : 'blocked'

  return Object.freeze({
    blockedReasons: Object.freeze([...blockedReasons]),
    enableFeaturePackIds: Object.freeze(enableFeaturePackIds),
    includedFeaturePackIds,
    installFeaturePackIds: Object.freeze(installFeaturePackIds),
    mode,
    ready: status === 'ready',
    status,
    targetFeaturePackIds: Object.freeze([...targetFeaturePackIds]),
  })
}

function getCanvasAppFeaturePackInstallPlanConflictReasons({
  graph,
  includedFeaturePackIds,
  mode,
}: {
  graph: CanvasAppFeaturePackInstallPlanGraph
  includedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  mode: CanvasAppFeaturePackInstallPlanMode
}): readonly CanvasAppFeaturePackInstallPlanConflictReason[] {
  const includedIdSet = new Set(includedFeaturePackIds)
  const installedActiveIds = createCanvasAppFeaturePackInstallPlanActiveIdSet({
    graph,
    plannedFeaturePackIds: includedIdSet,
    stateKey: 'installed',
  })
  const enabledActiveIds = createCanvasAppFeaturePackInstallPlanActiveIdSet({
    graph,
    plannedFeaturePackIds: mode === 'enable' ? includedIdSet : new Set(),
    stateKey: 'enabled',
  })

  return Object.freeze([
    ...getCanvasAppFeaturePackInstallPlanConflictReasonsByScope({
      activeIds: installedActiveIds,
      graph,
      includedIdSet,
      scope: 'installed',
    }),
    ...(mode === 'enable'
      ? getCanvasAppFeaturePackInstallPlanConflictReasonsByScope({
          activeIds: enabledActiveIds,
          graph,
          includedIdSet,
          scope: 'enabled',
        })
      : []),
  ])
}

function createCanvasAppFeaturePackInstallPlanActiveIdSet({
  graph,
  plannedFeaturePackIds,
  stateKey,
}: {
  graph: CanvasAppFeaturePackInstallPlanGraph
  plannedFeaturePackIds: ReadonlySet<CanvasAppFeaturePackId>
  stateKey: 'enabled' | 'installed'
}) {
  return new Set(
    graph.manifests
      .filter((manifest) =>
        plannedFeaturePackIds.has(manifest.id) ||
        graph.stateById.get(manifest.id)?.[stateKey],
      )
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

function getCanvasAppFeaturePackInstallPlanConflictReasonsByScope({
  activeIds,
  graph,
  includedIdSet,
  scope,
}: {
  activeIds: ReadonlySet<CanvasAppFeaturePackId>
  graph: CanvasAppFeaturePackInstallPlanGraph
  includedIdSet: ReadonlySet<CanvasAppFeaturePackId>
  scope: CanvasAppFeaturePackInstallPlanConflictScope
}): readonly CanvasAppFeaturePackInstallPlanConflictReason[] {
  const plannedProvidedIds =
    createCanvasAppFeaturePackInstallPlanPlannedProvidedIdSet({
      graph,
      includedIdSet,
    })
  const reasonKeys = new Set<string>()
  const reasons: CanvasAppFeaturePackInstallPlanConflictReason[] = []

  for (const manifest of graph.manifests) {
    if (!activeIds.has(manifest.id)) {
      continue
    }

    for (const conflictId of manifest.conflicts) {
      if (!activeIds.has(conflictId)) {
        continue
      }

      if (
        !includedIdSet.has(manifest.id) &&
        !plannedProvidedIds.has(conflictId)
      ) {
        continue
      }

      const reason = Object.freeze({
        conflictId,
        featurePackId: manifest.id,
        kind: scope === 'installed' ? 'installed-conflict' : 'enabled-conflict',
        scope,
      }) satisfies CanvasAppFeaturePackInstallPlanConflictReason
      const reasonKey = [
        reason.kind,
        reason.featurePackId,
        reason.conflictId,
        reason.scope,
      ].join(':')

      if (!reasonKeys.has(reasonKey)) {
        reasons.push(reason)
        reasonKeys.add(reasonKey)
      }
    }
  }

  return Object.freeze(reasons)
}

function createCanvasAppFeaturePackInstallPlanPlannedProvidedIdSet({
  graph,
  includedIdSet,
}: {
  graph: CanvasAppFeaturePackInstallPlanGraph
  includedIdSet: ReadonlySet<CanvasAppFeaturePackId>
}) {
  return new Set(
    graph.manifests
      .filter((manifest) => includedIdSet.has(manifest.id))
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}
