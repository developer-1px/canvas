import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary'

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<
  TEffect,
  TResult,
>({
  executionResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<TEffect, TResult> {
  const summary =
    getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult,
    })

  if (executionResult.status === 'completed') {
    return Object.freeze({
      actionKind: executionResult.actionKind,
      canCommit: true,
      currentModel: executionResult.currentModel,
      executionResult,
      nextAssemblyInput: executionResult.nextAssemblyInput,
      nextModel: executionResult.nextModel,
      status: 'ready-to-commit',
      summary,
      uninstallDataPlan: executionResult.uninstallDataPlan,
      updateMode: executionResult.updateMode,
    })
  }

  return Object.freeze({
    actionKind: executionResult.actionKind,
    canCommit: false,
    currentModel: executionResult.currentModel,
    executionResult,
    status: executionResult.status,
    summary,
    uninstallDataPlan: executionResult.uninstallDataPlan,
    updateMode: executionResult.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<
  TEffect,
  TResult,
>({
  commitPlan,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<TEffect, TResult> {
  if (commitPlan.canCommit) {
    return Object.freeze({
      actionKind: commitPlan.actionKind,
      commitPlan,
      committed: true,
      nextAssemblyInput: commitPlan.nextAssemblyInput,
      nextModel: commitPlan.nextModel,
      previousAssemblyInput: commitPlan.currentModel.assemblyInput,
      previousModel: commitPlan.currentModel,
      status: 'committed',
      summary: commitPlan.summary,
      uninstallDataPlan: commitPlan.uninstallDataPlan,
      updateMode: commitPlan.updateMode,
    })
  }

  return Object.freeze({
    actionKind: commitPlan.actionKind,
    commitPlan,
    committed: false,
    currentAssemblyInput: commitPlan.currentModel.assemblyInput,
    currentModel: commitPlan.currentModel,
    holdReason: commitPlan.status,
    status: 'held',
    summary: commitPlan.summary,
    uninstallDataPlan: commitPlan.uninstallDataPlan,
    updateMode: commitPlan.updateMode,
  })
}
