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
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplacePartialUpdateReason,
  CanvasAppFeaturePackProfileMarketplaceStateChange,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplacePartialUpdateFeaturePackIds(
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    stateChanges
      .filter((change) => change.from.installed && change.to.installed)
      .map((change) => change.id),
  )
}

export function getCanvasAppFeaturePackProfileMarketplacePartialUpdateReasons({
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

export function getCanvasAppFeaturePackProfileMarketplacePartialUpdateSurfaceIds({
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
