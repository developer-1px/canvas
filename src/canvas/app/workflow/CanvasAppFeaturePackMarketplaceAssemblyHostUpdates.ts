import {
  applyCanvasAppFeaturePackRuntimeStatePatch,
} from '../feature-packs'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyFeaturePackStates,
} from './CanvasAppFeaturePackAssemblyInputs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdate<
  TEffect,
  TResult,
>(
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult<
      TEffect,
      TResult
    >,
): CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult<
    TEffect,
    TResult
  > {
  const { transactionResult, ...transactionHostUpdate } = hostUpdate
  void transactionResult

  return Object.freeze(transactionHostUpdate)
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch<
  TEffect,
  TResult,
>({
  commitResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput<
  TEffect,
  TResult
>):
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult<
    TEffect,
    TResult
  > {
  if (!commitResult.committed) {
    return Object.freeze({
      actionKind: commitResult.actionKind,
      commitResult,
      currentFeaturePackStates:
        getCanvasAppFeaturePackMarketplaceAssemblyFeaturePackStates(
          commitResult.currentModel,
        ),
      holdReason: commitResult.holdReason,
      patch: null,
      patched: false,
      status: 'held',
      updateMode: commitResult.updateMode,
    })
  }

  const currentFeaturePackStates =
    getCanvasAppFeaturePackMarketplaceAssemblyFeaturePackStates(
      commitResult.previousModel,
    )
  const nextFeaturePackStates =
    getCanvasAppFeaturePackMarketplaceAssemblyFeaturePackStates(
      commitResult.nextModel,
  )

  return Object.freeze({
    actionKind: commitResult.actionKind,
    commitResult,
    currentFeaturePackStates,
    nextFeaturePackStates,
    patch: applyCanvasAppFeaturePackRuntimeStatePatch({
      featurePackIds: commitResult.nextModel.featurePackManifests.map((
        manifest,
      ) => manifest.id),
      featurePackStates: nextFeaturePackStates,
      options: {
        featurePackStates: currentFeaturePackStates,
      },
    }),
    patched: true,
    status: 'patched',
    updateMode: commitResult.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate<
  TEffect,
  TResult,
>({
  transactionResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput<
  TEffect,
  TResult
>):
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult<
    TEffect,
    TResult
  > {
  const { commitResult, runtimeStatePatch } = transactionResult

  if (!commitResult.committed) {
    if (runtimeStatePatch.patched) {
      throw new Error(
        'Canvas app marketplace transaction host update expected held runtime state patch',
      )
    }

    return Object.freeze({
      actionKind: transactionResult.actionKind,
      currentAssemblyInput: commitResult.currentAssemblyInput,
      holdReason: commitResult.holdReason,
      ready: false,
      runtimeStatePatch,
      status: 'held',
      transactionResult,
      update: null,
      updateMode: transactionResult.updateMode,
    })
  }

  if (!runtimeStatePatch.patched) {
    throw new Error(
      'Canvas app marketplace transaction host update expected patched runtime state patch',
    )
  }

  const update: CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate
    = Object.freeze({
      assemblyInput: commitResult.nextAssemblyInput,
      featurePackStates: runtimeStatePatch.nextFeaturePackStates,
      kind: 'replace-assembly-input',
      runtimeStatePatch: runtimeStatePatch.patch,
      updateMode: commitResult.updateMode,
    })

  return Object.freeze({
    actionKind: transactionResult.actionKind,
    currentAssemblyInput: commitResult.previousAssemblyInput,
    nextAssemblyInput: commitResult.nextAssemblyInput,
    ready: true,
    runtimeStatePatch,
    status: 'ready',
    transactionResult,
    update,
    updateMode: commitResult.updateMode,
  })
}

export function applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate<
  TEffect,
  TResult,
>({
  hostUpdate,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput<
  TEffect,
  TResult
>):
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult<
    TEffect,
    TResult
  > {
  if (hostUpdate.ready) {
    return Object.freeze({
      actionKind: hostUpdate.actionKind,
      applied: true,
      assemblyInput: hostUpdate.nextAssemblyInput,
      currentAssemblyInput: hostUpdate.currentAssemblyInput,
      hostUpdate,
      nextAssemblyInput: hostUpdate.nextAssemblyInput,
      status: 'applied',
      update: hostUpdate.update,
      updateMode: hostUpdate.updateMode,
    })
  }

  return Object.freeze({
    actionKind: hostUpdate.actionKind,
    applied: false,
    assemblyInput: hostUpdate.currentAssemblyInput,
    currentAssemblyInput: hostUpdate.currentAssemblyInput,
    holdReason: hostUpdate.holdReason,
    hostUpdate,
    status: 'held',
    update: null,
    updateMode: hostUpdate.updateMode,
  })
}
