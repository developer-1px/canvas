import {
  getCanvasAppFeaturePackMarketplaceSelectionTargetControl,
} from '../feature-packs'
import {
  executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction,
} from '../workflow'
import { applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate } from './CanvasAppAssemblySourceMarketplaceHostUpdates'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult,
} from './CanvasAppAssemblySourceMarketplaceTargetTransactionContracts'
import { snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget } from './CanvasAppAssemblySourceMarketplaceTargets'

export async function executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction<
  TEffect,
  TResult,
>({
  cleanupHandlers,
  executeCleanupEffect,
  model,
  source,
  target,
}: CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  const transactionResult =
    await executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction({
      cleanupHandlers,
      executeCleanupEffect,
      model,
      target,
    })
  const sourceResult =
    applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate({
      hostUpdate: transactionResult.hostUpdate,
      source,
    })

  if (sourceResult.applied) {
    return Object.freeze({
      actionKind: sourceResult.actionKind,
      applied: true,
      hostUpdate: sourceResult.hostUpdate,
      source: sourceResult.source,
      sourceResult,
      status: 'applied',
      transactionResult,
      update: sourceResult.update,
      updateMode: sourceResult.updateMode,
    })
  }

  return Object.freeze({
    actionKind: sourceResult.actionKind,
    applied: false,
    holdReason: sourceResult.holdReason,
    hostUpdate: sourceResult.hostUpdate,
    source: sourceResult.source,
    sourceResult,
    status: 'held',
    transactionResult,
    update: null,
    updateMode: sourceResult.updateMode,
  })
}

export async function executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction<
  TEffect,
  TResult,
>({
  control,
  ...input
}: CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  if (control.item === null || control.actionKind === null) {
    const source = input.source ?? Object.freeze({
      assemblyInput: input.model.assemblyInput,
    })

    return Object.freeze({
      actionKind: null,
      applied: false,
      control,
      holdReason: 'missing-target',
      hostUpdate: null,
      source,
      sourceResult: null,
      status: 'missing',
      target: control.target,
      transactionResult: null,
      update: null,
      updateMode: 'blocked',
    })
  }

  return executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction(
    {
      ...input,
      target: control.target,
    },
  )
}

export async function executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction<
  TEffect,
  TResult,
>({
  selection,
  target,
  ...input
}: CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput<
  TEffect,
  TResult
>): Promise<
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult<
    TEffect,
    TResult
  >
> {
  const control = getCanvasAppFeaturePackMarketplaceSelectionTargetControl({
    selection,
    target,
  })

  if (!control) {
    const source = input.source ?? Object.freeze({
      assemblyInput: input.model.assemblyInput,
    })

    return Object.freeze({
      actionKind: null,
      applied: false,
      control: null,
      holdReason: 'missing-selection-target',
      hostUpdate: null,
      selection,
      source,
      sourceResult: null,
      status: 'missing-selection-target',
      target: snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget(
        target,
      ),
      transactionResult: null,
      update: null,
      updateMode: 'blocked',
    })
  }

  return executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
    {
      ...input,
      control,
    },
  )
}
