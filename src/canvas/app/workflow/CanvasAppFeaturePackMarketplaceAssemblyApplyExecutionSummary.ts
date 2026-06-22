import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'
import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary<
  TEffect,
  TResult,
>({
  executionResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary {
  if (executionResult.status === 'blocked') {
    return Object.freeze({
      actionKind: executionResult.actionKind,
      blockedReasonCount: executionResult.blockedReasonCount,
      changedFeaturePackIds:
        Object.freeze([...executionResult.applyResult.changedFeaturePackIds]),
      cleanup:
        getCanvasAppFeaturePackMarketplaceAssemblyApplyNotRunCleanupSummary(),
      marketplaceBlockedReasonCount:
        executionResult.marketplaceBlockedReasonCount,
      partialUpdateSurfaceIds:
        Object.freeze([...executionResult.applyResult.partialUpdateSurfaceIds]),
      status: executionResult.status,
      totalBlockedReasonCount: executionResult.totalBlockedReasonCount,
      uninstallDataPlan: executionResult.uninstallDataPlan,
      updateMode: executionResult.updateMode,
    })
  }

  return Object.freeze({
    actionKind: executionResult.actionKind,
    blockedReasonCount: 0,
    changedFeaturePackIds:
      Object.freeze([...executionResult.applyResult.changedFeaturePackIds]),
    cleanup:
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCleanupExecutionSummary(
        executionResult.cleanupExecutionResult,
      ),
    marketplaceBlockedReasonCount: 0,
    partialUpdateSurfaceIds:
      Object.freeze([...executionResult.applyResult.partialUpdateSurfaceIds]),
    status: executionResult.status,
    totalBlockedReasonCount: 0,
    uninstallDataPlan: executionResult.uninstallDataPlan,
    updateMode: executionResult.updateMode,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyCleanupExecutionSummary<
  TEffect,
  TResult,
>(
  cleanupExecutionResult:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
      TEffect,
      TResult
    >,
): CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary {
  return Object.freeze({
    effectCount: cleanupExecutionResult.cleanupEffectPlan.effects.length,
    failedScopeCount: cleanupExecutionResult.failedScopeIds.length,
    failedScopeIds: Object.freeze([
      ...cleanupExecutionResult.failedScopeIds,
    ]),
    handledScopeCount:
      cleanupExecutionResult.cleanupEffectPlan.handledScopeIds.length,
    handledScopeIds: Object.freeze([
      ...cleanupExecutionResult.cleanupEffectPlan.handledScopeIds,
    ]),
    missingHandlerScopeCount:
      cleanupExecutionResult.cleanupEffectPlan.missingHandlerScopeIds.length,
    missingHandlerScopeIds: Object.freeze([
      ...cleanupExecutionResult.cleanupEffectPlan.missingHandlerScopeIds,
    ]),
    skippedScopeCount: cleanupExecutionResult.skippedScopeIds.length,
    skippedScopeIds: Object.freeze([
      ...cleanupExecutionResult.skippedScopeIds,
    ]),
    status: cleanupExecutionResult.status,
    succeededScopeCount: cleanupExecutionResult.succeededScopeIds.length,
    succeededScopeIds: Object.freeze([
      ...cleanupExecutionResult.succeededScopeIds,
    ]),
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyNotRunCleanupSummary():
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary {
  return Object.freeze({
    effectCount: 0,
    failedScopeCount: 0,
    failedScopeIds: Object.freeze([]),
    handledScopeCount: 0,
    handledScopeIds: Object.freeze([]),
    missingHandlerScopeCount: 0,
    missingHandlerScopeIds: Object.freeze([]),
    skippedScopeCount: 0,
    skippedScopeIds: Object.freeze([]),
    status: 'not-run',
    succeededScopeCount: 0,
    succeededScopeIds: Object.freeze([]),
  })
}
