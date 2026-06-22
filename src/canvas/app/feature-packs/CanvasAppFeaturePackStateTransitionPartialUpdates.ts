import type {
  CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackPartialUpdatePlan,
} from './CanvasAppFeaturePackPartialUpdatePlan'
import type {
  CanvasAppFeaturePackStateTransitionContext,
} from './CanvasAppFeaturePackStateTransitionContext'
import type {
  CanvasAppFeaturePackStateTransitionPartialUpdateReason,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

export function getCanvasAppFeaturePackStateTransitionPartialUpdateBlockedReasons({
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

export function getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
  context,
  ids,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
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
