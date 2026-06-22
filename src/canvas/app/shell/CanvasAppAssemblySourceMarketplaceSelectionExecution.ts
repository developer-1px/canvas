import {
  getCanvasAppFeaturePackMarketplaceTargetControl,
} from '../feature-packs'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult,
} from './CanvasAppAssemblySourceMarketplaceSelectionExecutionContracts'
import {
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction,
} from './CanvasAppAssemblySourceMarketplaceTargetTransactions'
import {
  createCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleTargetActionResult,
  getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult,
  getCanvasAppFeaturePackMarketplaceAssemblyModelFromSource,
} from './CanvasAppAssemblySourceMarketplaceSelectionExecutionResult'

export async function executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransaction<
  TEffect,
  TResult,
>({
  cleanupHandlers,
  executeCleanupEffect,
  execution,
  model,
  source,
}: CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  let currentModel = model
  let currentSource = source ?? Object.freeze({
    assemblyInput: model.assemblyInput,
  })
  const initialSource = currentSource
  const results:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >[] = []

  for (const readyControl of execution.readyControls) {
    const currentControl = getCanvasAppFeaturePackMarketplaceTargetControl({
      model: currentModel.marketplaceModel,
      target: readyControl.target,
    })

    if (
      currentControl.item !== null &&
      currentControl.actionKind !== readyControl.actionKind
    ) {
      results.push(createCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleTargetActionResult(
        {
          control: currentControl,
          expectedActionKind: readyControl.actionKind,
          source: currentSource,
        },
      ))
      continue
    }

    const result =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
        {
          cleanupHandlers,
          control: currentControl,
          executeCleanupEffect,
          model: currentModel,
          source: currentSource,
        },
      )

    results.push(result)
    currentSource = result.source

    if (result.applied) {
      currentModel =
        getCanvasAppFeaturePackMarketplaceAssemblyModelFromSource({
          model: currentModel,
          source: result.source,
        })
    }
  }

  return getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult(
    {
      currentModel,
      execution,
      initialSource,
      model,
      results,
      source: currentSource,
    },
  )
}
