import {
  executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'

export async function executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
  TEffect,
  TResult,
>({
  executeCleanupEffect,
  executionPlan,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput<
  TEffect,
  TResult
>):
  Promise<
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
      TEffect,
      TResult
    >
  > {
  if (executionPlan.status === 'blocked') {
    return Object.freeze({
      actionKind: executionPlan.actionKind,
      applyResult: executionPlan.applyResult,
      blockedReasonCount: executionPlan.blockedReasonCount,
      currentModel: executionPlan.currentModel,
      executionPlan,
      marketplaceBlockedReasonCount:
        executionPlan.marketplaceBlockedReasonCount,
      status: 'blocked',
      totalBlockedReasonCount: executionPlan.totalBlockedReasonCount,
      uninstallDataPlan: executionPlan.uninstallDataPlan,
      updateMode: 'blocked',
    })
  }

  const cleanupExecutionResult =
    await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
      cleanupEffectPlan: executionPlan.cleanupEffectPlan,
      executeEffect: executeCleanupEffect,
    })

  return Object.freeze({
    actionKind: executionPlan.actionKind,
    applyResult: executionPlan.applyResult,
    cleanupExecutionResult,
    currentModel: executionPlan.currentModel,
    executionPlan,
    nextAssemblyInput: executionPlan.nextAssemblyInput,
    nextModel: executionPlan.nextModel,
    status:
      getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus(
        cleanupExecutionResult.status,
      ),
    uninstallDataPlan: executionPlan.uninstallDataPlan,
    updateMode: executionPlan.updateMode,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus(
  cleanupExecutionStatus:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
): Exclude<
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus,
  'blocked'
> {
  if (cleanupExecutionStatus === 'failed') {
    return 'cleanup-failed'
  }

  if (cleanupExecutionStatus === 'needs-handler') {
    return 'needs-cleanup-handler'
  }

  return 'completed'
}
