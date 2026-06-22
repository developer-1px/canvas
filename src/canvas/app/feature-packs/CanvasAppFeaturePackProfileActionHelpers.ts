import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplaceStateChange,
} from './CanvasAppFeaturePackProfileActionContracts'
import type {
  CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'

export function createCanvasAppFeaturePackProfileMarketplaceTargetStates({
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

export function getCanvasAppFeaturePackProfileMarketplaceStateChanges(
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
