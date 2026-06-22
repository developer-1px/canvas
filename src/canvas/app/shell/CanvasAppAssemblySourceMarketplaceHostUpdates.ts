import {
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
} from '../workflow'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult,
} from './CanvasAppAssemblySourceMarketplaceHostUpdateContracts'

export function applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate<
  TEffect,
  TResult,
>({
  hostUpdate,
  source,
}: CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput<
  TEffect,
  TResult
>):
  CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult<
    TEffect,
    TResult
  > {
  const application =
    applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate({
      hostUpdate,
    })

  if (application.applied) {
    const nextSource = Object.freeze({
      assemblyInput: application.assemblyInput,
    })

    return Object.freeze({
      actionKind: application.actionKind,
      applied: true,
      application,
      assemblyInput: application.assemblyInput,
      hostUpdate: application.hostUpdate,
      source: nextSource,
      status: 'applied',
      update: application.update,
      updateMode: application.updateMode,
    })
  }

  return Object.freeze({
    actionKind: application.actionKind,
    applied: false,
    application,
    assemblyInput: application.assemblyInput,
    holdReason: application.holdReason,
    hostUpdate: application.hostUpdate,
    source: source ?? Object.freeze({
      assemblyInput: application.assemblyInput,
    }),
    status: 'held',
    update: null,
    updateMode: application.updateMode,
  })
}
