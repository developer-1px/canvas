import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackInstallPlan,
  CanvasAppFeaturePackInstallPlanBlockedReason,
  CanvasAppFeaturePackInstallPlanMode,
} from './CanvasAppFeaturePackInstallPlanContracts'
import type {
  CanvasAppFeaturePackInstallPlanGraph,
} from './CanvasAppFeaturePackInstallPlanGraph'

export function createCanvasAppFeaturePackInstallPlanResult({
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
