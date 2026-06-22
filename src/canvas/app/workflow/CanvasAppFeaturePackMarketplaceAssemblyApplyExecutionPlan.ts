import {
  createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'

export function createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
  TEffect,
>({
  applyResult,
  cleanupHandlers = [],
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput<TEffect>):
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<TEffect> {
  if (applyResult.status === 'blocked') {
    return Object.freeze({
      actionKind: applyResult.actionKind,
      applyResult,
      blockedReasonCount: applyResult.blockedReasonCount,
      currentModel: applyResult.currentModel,
      marketplaceBlockedReasonCount: applyResult.marketplaceBlockedReasonCount,
      status: 'blocked',
      totalBlockedReasonCount: applyResult.totalBlockedReasonCount,
      uninstallDataPlan: applyResult.uninstallDataPlan,
      updateMode: 'blocked',
    }) satisfies CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan
  }

  const cleanupEffectPlan =
    createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
      handlers: cleanupHandlers,
      uninstallDataPlan: applyResult.uninstallDataPlan,
    })

  return Object.freeze({
    actionKind: applyResult.actionKind,
    applyResult,
    cleanupEffectPlan,
    currentModel: applyResult.currentModel,
    nextAssemblyInput: applyResult.assemblyInput,
    nextModel: applyResult.nextModel,
    status: cleanupEffectPlan.status === 'needs-handler'
      ? 'needs-cleanup-handler'
      : 'ready',
    uninstallDataPlan: applyResult.uninstallDataPlan,
    updateMode: applyResult.updateMode,
  }) satisfies
    CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan<TEffect> |
    CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan<TEffect>
}
