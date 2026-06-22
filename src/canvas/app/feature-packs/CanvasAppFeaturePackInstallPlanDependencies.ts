import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackInstallPlanBlockedReason,
  CanvasAppFeaturePackInstallPlanMode,
} from './CanvasAppFeaturePackInstallPlanContracts'
import type {
  CanvasAppFeaturePackInstallPlanGraph,
} from './CanvasAppFeaturePackInstallPlanGraph'

export function getCanvasAppFeaturePackInstallPlanIncludedFeaturePackIds({
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
