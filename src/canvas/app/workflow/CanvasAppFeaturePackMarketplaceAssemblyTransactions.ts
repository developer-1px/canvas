import {
  getCanvasAppFeaturePackMarketplaceAssemblyItemAction,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetAction,
  type CanvasAppFeaturePackMarketplaceAssemblyActionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyItemInput,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyActionAdapters'
import {
  createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyExecution'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdate,
} from './CanvasAppFeaturePackMarketplaceAssemblyHostUpdates'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput,
  CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyResult(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyResult {
  const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(input)

  if (applyPlan.status === 'blocked') {
    return Object.freeze({
      ...applyPlan,
      currentModel: input.model,
    })
  }

  return Object.freeze({
    ...applyPlan,
    currentModel: input.model,
    nextModel: getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: applyPlan.assemblyInput,
      listings: input.model.listings,
      profiles: input.model.profiles,
      suiteManifests: input.model.suiteManifests,
    }),
  })
}

export async function executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction<
  TEffect,
  TResult,
>({
  action,
  cleanupHandlers = [],
  executeCleanupEffect,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
    action,
    model,
  })
  const executionPlan =
    createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
      applyResult,
      cleanupHandlers,
    })
  const executionResult =
    await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
      executeCleanupEffect,
      executionPlan,
    })
  const commitPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan({
    executionResult,
  })
  const commitResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult(
    {
      commitPlan,
    },
  )
  const runtimeStatePatch =
    getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch({
      commitResult,
    })
  const transactionResult = Object.freeze({
    action,
    actionKind: executionResult.actionKind,
    applyResult,
    commitPlan,
    commitResult,
    executionPlan,
    executionResult,
    model,
    runtimeStatePatch,
    status: commitResult.status,
    summary: commitPlan.summary,
    updateMode: commitPlan.updateMode,
  }) satisfies CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
      TEffect,
      TResult
    >
  const hostUpdate =
    getCanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdate(
      getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate({
        transactionResult,
      }),
    )

  return Object.freeze({
    ...transactionResult,
    hostUpdate,
  })
}

export async function executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction<
  TEffect,
  TResult,
>({
  cleanupHandlers = [],
  executeCleanupEffect,
  item,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  return executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
    action: getCanvasAppFeaturePackMarketplaceAssemblyItemAction({
      item,
      model,
    }),
    cleanupHandlers,
    executeCleanupEffect,
    model,
  })
}

export async function executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction<
  TEffect,
  TResult,
>({
  cleanupHandlers = [],
  executeCleanupEffect,
  model,
  target,
}: CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  return executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
    action: getCanvasAppFeaturePackMarketplaceAssemblyTargetAction({
      model,
      target,
    }),
    cleanupHandlers,
    executeCleanupEffect,
    model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult(
  input: CanvasAppFeaturePackMarketplaceAssemblyItemInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyResult {
  return getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
    action: getCanvasAppFeaturePackMarketplaceAssemblyItemAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyResult {
  return getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
    action: getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(input),
    model: input.model,
  })
}
