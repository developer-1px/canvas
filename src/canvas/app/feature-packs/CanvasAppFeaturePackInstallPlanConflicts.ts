import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackInstallPlanConflictReason,
  CanvasAppFeaturePackInstallPlanConflictScope,
  CanvasAppFeaturePackInstallPlanMode,
} from './CanvasAppFeaturePackInstallPlanContracts'
import type {
  CanvasAppFeaturePackInstallPlanGraph,
} from './CanvasAppFeaturePackInstallPlanGraph'

export function getCanvasAppFeaturePackInstallPlanConflictReasons({
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
