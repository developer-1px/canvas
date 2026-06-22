import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
} from '../feature-packs'
import {
  appendCanvasAppFeaturePackMarketplaceUniqueId,
  type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan'
import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanupContracts'

export function getCanvasAppFeaturePackMarketplaceUninstallCleanupHandlerMap<
  TEffect,
>(
  handlers:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
      TEffect
    >[],
): ReadonlyMap<
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<TEffect>
> {
  const handlerByScopeId = new Map<
    CanvasAppFeaturePackManifestOrphanedDataScopeId,
    CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<TEffect>
  >()

  for (const handler of handlers) {
    if (handlerByScopeId.has(handler.scopeId)) {
      throw new Error(
        `Duplicate canvas app feature pack uninstall cleanup handler: ${handler.scopeId}`,
      )
    }

    handlerByScopeId.set(handler.scopeId, handler)
  }

  return handlerByScopeId
}

export function getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId(
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
): ReadonlyMap<
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  readonly CanvasAppFeaturePackId[]
> {
  const featurePackIdsByScopeId = new Map<
    CanvasAppFeaturePackManifestOrphanedDataScopeId,
    CanvasAppFeaturePackId[]
  >()

  for (const entry of uninstallDataPlan.entries) {
    if (entry.orphanedDataPolicy !== 'remove') {
      continue
    }

    for (const scopeId of entry.orphanedDataScopeIds) {
      const featurePackIds = featurePackIdsByScopeId.get(scopeId) ?? []

      appendCanvasAppFeaturePackMarketplaceUniqueId(
        featurePackIds,
        entry.featurePackId,
      )
      featurePackIdsByScopeId.set(scopeId, featurePackIds)
    }
  }

  return featurePackIdsByScopeId
}
