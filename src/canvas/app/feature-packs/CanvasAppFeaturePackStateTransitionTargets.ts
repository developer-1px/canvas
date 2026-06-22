import type {
  CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackInstallPlan,
} from './CanvasAppFeaturePackInstallPlan'
import type {
  CanvasAppFeaturePackStateTransitionContext,
} from './CanvasAppFeaturePackStateTransitionContext'
import {
  getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds,
} from './CanvasAppFeaturePackStateTransitionPartialUpdates'
import type {
  CanvasAppFeaturePackStateTransitionBlockedReason,
  CanvasAppFeaturePackStateTransitionInstallPlanReason,
  CanvasAppFeaturePackStateTransitionPlanInput,
  CanvasAppFeaturePackStateTransitionUnknownTargetReason,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

export type CanvasAppFeaturePackStateTransitionTargetChanges = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  disableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  enableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installFeaturePackIds: readonly CanvasAppFeaturePackId[]
  partialUpdateFeaturePackIds: readonly CanvasAppFeaturePackId[]
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  statusById: ReadonlyMap<
    CanvasAppFeaturePackId,
    'disabled' | 'enabled' | 'uninstalled'
  >
  uninstallFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export function getCanvasAppFeaturePackStateTransitionTargetStateChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}): CanvasAppFeaturePackStateTransitionTargetChanges {
  if (input.operation === 'install' || input.operation === 'enable') {
    return getCanvasAppFeaturePackStateTransitionInstallTargetChanges({
      context,
      input,
    })
  }

  return getCanvasAppFeaturePackStateTransitionDirectTargetChanges({
    context,
    input,
  })
}

function getCanvasAppFeaturePackStateTransitionInstallTargetChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}): CanvasAppFeaturePackStateTransitionTargetChanges {
  const mode = input.operation === 'enable' ? 'enable' : 'install'
  const installPlan = getCanvasAppFeaturePackInstallPlan({
    manifests: context.manifests,
    mode,
    options: input.options,
    targetFeaturePackIds: input.targetFeaturePackIds,
  })
  const statusById = new Map<CanvasAppFeaturePackId, 'disabled' | 'enabled'>()

  for (const id of installPlan.installFeaturePackIds) {
    statusById.set(id, mode === 'enable' ? 'enabled' : 'disabled')
  }

  for (const id of installPlan.enableFeaturePackIds) {
    statusById.set(id, 'enabled')
  }

  return Object.freeze({
    blockedReasons: Object.freeze(installPlan.blockedReasons.map((reason) =>
      Object.freeze({
        kind: 'install-plan-blocked',
        reason,
      }) satisfies CanvasAppFeaturePackStateTransitionInstallPlanReason,
    )),
    changedFeaturePackIds: Object.freeze(Array.from(statusById.keys())),
    disableFeaturePackIds: Object.freeze([]),
    enableFeaturePackIds: installPlan.enableFeaturePackIds,
    installFeaturePackIds: installPlan.installFeaturePackIds,
    partialUpdateFeaturePackIds: mode === 'enable'
      ? installPlan.enableFeaturePackIds
      : Object.freeze([]),
    partialUpdateSurfaceIds: mode === 'enable'
      ? getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
          context,
          ids: installPlan.enableFeaturePackIds,
        })
      : Object.freeze([]),
    statusById,
    uninstallFeaturePackIds: Object.freeze([]),
  })
}

function getCanvasAppFeaturePackStateTransitionDirectTargetChanges({
  context,
  input,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  input: CanvasAppFeaturePackStateTransitionPlanInput
}): CanvasAppFeaturePackStateTransitionTargetChanges {
  const statusById = new Map<CanvasAppFeaturePackId, 'disabled' | 'uninstalled'>()
  const unknownBlockedReasons:
    CanvasAppFeaturePackStateTransitionUnknownTargetReason[] = []

  for (const targetFeaturePackId of input.targetFeaturePackIds) {
    if (!context.manifestById.has(targetFeaturePackId)) {
      unknownBlockedReasons.push(Object.freeze({
        kind: 'unknown-target-pack',
        targetId: targetFeaturePackId,
      }))
      continue
    }

    const currentState = context.currentStateById.get(targetFeaturePackId)

    if (!currentState?.installed) {
      continue
    }

    if (input.operation === 'disable' && currentState.enabled) {
      statusById.set(targetFeaturePackId, 'disabled')
    }

    if (input.operation === 'uninstall') {
      statusById.set(targetFeaturePackId, 'uninstalled')
    }
  }

  const changedFeaturePackIds = Object.freeze(Array.from(statusById.keys()))

  return Object.freeze({
    blockedReasons: Object.freeze(unknownBlockedReasons),
    changedFeaturePackIds,
    disableFeaturePackIds: input.operation === 'disable'
      ? changedFeaturePackIds
      : Object.freeze([]),
    enableFeaturePackIds: Object.freeze([]),
    installFeaturePackIds: Object.freeze([]),
    partialUpdateFeaturePackIds: input.operation === 'disable'
      ? changedFeaturePackIds
      : Object.freeze([]),
    partialUpdateSurfaceIds: input.operation === 'disable'
      ? getCanvasAppFeaturePackStateTransitionPartialUpdateSurfaceIds({
          context,
          ids: changedFeaturePackIds,
        })
      : Object.freeze([]),
    statusById,
    uninstallFeaturePackIds: input.operation === 'uninstall'
      ? changedFeaturePackIds
      : Object.freeze([]),
  })
}
