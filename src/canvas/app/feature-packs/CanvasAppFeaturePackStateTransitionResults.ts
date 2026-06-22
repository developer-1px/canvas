import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackStateTransitionContext,
} from './CanvasAppFeaturePackStateTransitionContext'
import type {
  CanvasAppFeaturePackStateTransitionChange,
  CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

export function getCanvasAppFeaturePackStateTransitionNextStates({
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

export function getCanvasAppFeaturePackStateTransitionChanges({
  currentStateById,
  nextStates,
}: {
  currentStateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
  nextStates: readonly CanvasAppFeaturePackRuntimeState[]
}): readonly CanvasAppFeaturePackStateTransitionChange[] {
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

export function getCanvasAppFeaturePackStateTransitionUninstallPolicyEntries({
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
