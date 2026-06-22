import {
  assertCanvasAppFeaturePackManifests,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackInstallPlanConflictReasons,
} from './CanvasAppFeaturePackInstallPlanConflicts'
import type {
  CanvasAppFeaturePackInstallPlan,
  CanvasAppFeaturePackInstallPlanBlockedReason,
  CanvasAppFeaturePackInstallPlanInput,
} from './CanvasAppFeaturePackInstallPlanContracts'
import {
  getCanvasAppFeaturePackInstallPlanIncludedFeaturePackIds,
} from './CanvasAppFeaturePackInstallPlanDependencies'
import {
  createCanvasAppFeaturePackInstallPlanGraph,
} from './CanvasAppFeaturePackInstallPlanGraph'
import {
  createCanvasAppFeaturePackInstallPlanResult,
} from './CanvasAppFeaturePackInstallPlanResult'

export type {
  CanvasAppFeaturePackInstallPlan,
  CanvasAppFeaturePackInstallPlanBlockedReason,
  CanvasAppFeaturePackInstallPlanConflictReason,
  CanvasAppFeaturePackInstallPlanConflictScope,
  CanvasAppFeaturePackInstallPlanInput,
  CanvasAppFeaturePackInstallPlanMissingRequiredReason,
  CanvasAppFeaturePackInstallPlanMode,
  CanvasAppFeaturePackInstallPlanStatus,
  CanvasAppFeaturePackInstallPlanUnknownTargetReason,
} from './CanvasAppFeaturePackInstallPlanContracts'

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
