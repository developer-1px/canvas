import type {
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffect,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanupContracts'
import {
  getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId,
  getCanvasAppFeaturePackMarketplaceUninstallCleanupHandlerMap,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanupScopes'

export function createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<
  TEffect,
>({
  handlers = [],
  uninstallDataPlan,
}: CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput<TEffect>):
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<TEffect> {
  const handlerByScopeId =
    getCanvasAppFeaturePackMarketplaceUninstallCleanupHandlerMap(handlers)
  const featurePackIdsByScopeId =
    getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId(
      uninstallDataPlan,
    )
  const effects:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>[] = []
  const handledScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const missingHandlerScopeIds:
    CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []

  for (const scopeId of uninstallDataPlan.removeScopeIds) {
    const handler = handlerByScopeId.get(scopeId)
    const featurePackIds = featurePackIdsByScopeId.get(scopeId) ?? []

    if (!handler) {
      missingHandlerScopeIds.push(scopeId)
      continue
    }

    const effect = handler.createEffect({
      featurePackIds: Object.freeze([...featurePackIds]),
      scopeId,
      uninstallDataPlan,
    })

    effects.push(Object.freeze({
      effect,
      featurePackIds: Object.freeze([...featurePackIds]),
      scopeId,
    }))
    handledScopeIds.push(scopeId)
  }

  return Object.freeze({
    effects: Object.freeze(effects),
    handledScopeIds: Object.freeze(handledScopeIds),
    hostManagedFeaturePackIds:
      Object.freeze([...uninstallDataPlan.hostManagedFeaturePackIds]),
    hostManagedScopeIds:
      Object.freeze([...uninstallDataPlan.hostManagedScopeIds]),
    missingHandlerScopeIds: Object.freeze(missingHandlerScopeIds),
    preserveFeaturePackIds:
      Object.freeze([...uninstallDataPlan.preserveFeaturePackIds]),
    preserveScopeIds: Object.freeze([...uninstallDataPlan.preserveScopeIds]),
    removeFeaturePackIds:
      Object.freeze([...uninstallDataPlan.removeFeaturePackIds]),
    removeScopeIds: Object.freeze([...uninstallDataPlan.removeScopeIds]),
    status:
      getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus({
        handledScopeIds,
        missingHandlerScopeIds,
        removeScopeIds: uninstallDataPlan.removeScopeIds,
      }),
    unscopedFeaturePackIds:
      Object.freeze([...uninstallDataPlan.unscopedFeaturePackIds]),
    uninstallDataPlan,
  })
}

function getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus({
  handledScopeIds,
  missingHandlerScopeIds,
  removeScopeIds,
}: {
  handledScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  missingHandlerScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}): CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus {
  if (removeScopeIds.length === 0 && handledScopeIds.length === 0) {
    return 'empty'
  }

  if (missingHandlerScopeIds.length > 0) {
    return 'needs-handler'
  }

  return 'ready'
}
