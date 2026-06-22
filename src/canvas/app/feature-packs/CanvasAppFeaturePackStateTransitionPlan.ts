import {
  assertCanvasAppFeaturePackManifests,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackStateTransitionDependencyBlockedReasons,
  getCanvasAppFeaturePackStateTransitionLifecycleBlockedReasons,
} from './CanvasAppFeaturePackStateTransitionBlockedReasons'
import {
  createCanvasAppFeaturePackStateTransitionContext,
} from './CanvasAppFeaturePackStateTransitionContext'
import {
  getCanvasAppFeaturePackStateTransitionPartialUpdateBlockedReasons,
} from './CanvasAppFeaturePackStateTransitionPartialUpdates'
import {
  isCanvasAppFeaturePackStateTransitionOperation,
  type CanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlanInput,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'
import {
  getCanvasAppFeaturePackStateTransitionChanges,
  getCanvasAppFeaturePackStateTransitionNextStates,
  getCanvasAppFeaturePackStateTransitionUninstallPolicyEntries,
} from './CanvasAppFeaturePackStateTransitionResults'
import {
  getCanvasAppFeaturePackStateTransitionTargetStateChanges,
} from './CanvasAppFeaturePackStateTransitionTargets'

export type {
  CanvasAppFeaturePackStateTransitionBlockedReason,
  CanvasAppFeaturePackStateTransitionChange,
  CanvasAppFeaturePackStateTransitionDependencyReason,
  CanvasAppFeaturePackStateTransitionInstallPlanReason,
  CanvasAppFeaturePackStateTransitionLifecycleReason,
  CanvasAppFeaturePackStateTransitionOperation,
  CanvasAppFeaturePackStateTransitionPartialUpdateReason,
  CanvasAppFeaturePackStateTransitionPlan,
  CanvasAppFeaturePackStateTransitionPlanInput,
  CanvasAppFeaturePackStateTransitionPlanStatus,
  CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
  CanvasAppFeaturePackStateTransitionUnknownTargetReason,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

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
