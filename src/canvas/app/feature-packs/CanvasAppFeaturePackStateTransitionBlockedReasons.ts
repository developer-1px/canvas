import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackStateTransitionContext,
} from './CanvasAppFeaturePackStateTransitionContext'
import type {
  CanvasAppFeaturePackStateTransitionDependencyReason,
  CanvasAppFeaturePackStateTransitionLifecycleReason,
  CanvasAppFeaturePackStateTransitionOperation,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

export function getCanvasAppFeaturePackStateTransitionLifecycleBlockedReasons({
  context,
  ids,
  operation,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  ids: readonly CanvasAppFeaturePackId[]
  operation: CanvasAppFeaturePackStateTransitionOperation
}): readonly CanvasAppFeaturePackStateTransitionLifecycleReason[] {
  return Object.freeze(ids.flatMap((id) => {
    const manifest = context.manifestById.get(id)

    if (!manifest) {
      return []
    }

    if (operation === 'install' && !manifest.lifecycle.installable) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'install-unavailable',
      })]
    }

    if (
      (operation === 'disable' || operation === 'enable') &&
      !manifest.lifecycle.runtimeToggleable
    ) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'runtime-toggle-unavailable',
      })]
    }

    if (operation === 'uninstall' && !manifest.lifecycle.uninstallable) {
      return [createCanvasAppFeaturePackStateTransitionLifecycleReason({
        id,
        kind: 'uninstall-unavailable',
      })]
    }

    return []
  }))
}

function createCanvasAppFeaturePackStateTransitionLifecycleReason({
  id,
  kind,
}: {
  id: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackStateTransitionLifecycleReason['kind']
}): CanvasAppFeaturePackStateTransitionLifecycleReason {
  return Object.freeze({
    featurePackId: id,
    kind,
  })
}

export function getCanvasAppFeaturePackStateTransitionDependencyBlockedReasons({
  context,
  operation,
  targetFeaturePackIds,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  operation: CanvasAppFeaturePackStateTransitionOperation
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}): readonly CanvasAppFeaturePackStateTransitionDependencyReason[] {
  if (operation !== 'disable' && operation !== 'uninstall') {
    return []
  }

  const stateKey = operation === 'disable' ? 'enabled' : 'installed'
  const targetIdSet = new Set(targetFeaturePackIds)
  const targetProvidedIds = createCanvasAppFeaturePackStateTransitionProvidedIdSet(
    context,
    targetIdSet,
  )
  const reasons: CanvasAppFeaturePackStateTransitionDependencyReason[] = []

  for (const manifest of context.manifests) {
    if (targetIdSet.has(manifest.id)) {
      continue
    }

    if (!context.currentStateById.get(manifest.id)?.[stateKey]) {
      continue
    }

    for (const requiredId of manifest.requires) {
      if (!targetProvidedIds.has(requiredId)) {
        continue
      }

      reasons.push(Object.freeze({
        dependentFeaturePackId: manifest.id,
        featurePackId: getCanvasAppFeaturePackStateTransitionProviderFeaturePackId({
          context,
          requiredId,
          targetIdSet,
        }),
        kind: operation === 'disable'
          ? 'required-by-enabled-pack'
          : 'required-by-installed-pack',
        requiredId,
      }))
    }
  }

  return Object.freeze(reasons)
}

function createCanvasAppFeaturePackStateTransitionProvidedIdSet(
  context: CanvasAppFeaturePackStateTransitionContext,
  targetIdSet: ReadonlySet<CanvasAppFeaturePackId>,
) {
  return new Set(
    context.manifests
      .filter((manifest) => targetIdSet.has(manifest.id))
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

function getCanvasAppFeaturePackStateTransitionProviderFeaturePackId({
  context,
  requiredId,
  targetIdSet,
}: {
  context: CanvasAppFeaturePackStateTransitionContext
  requiredId: CanvasAppFeaturePackId
  targetIdSet: ReadonlySet<CanvasAppFeaturePackId>
}) {
  if (targetIdSet.has(requiredId)) {
    return requiredId
  }

  const provider = context.manifests.find((manifest) =>
    targetIdSet.has(manifest.id) && manifest.provides.includes(requiredId),
  )

  return provider?.id ?? requiredId
}
