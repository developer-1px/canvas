import {
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  createCanvasAppAssembly,
  type CanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
} from '../workflow'

export type CanvasAppAssemblySource =
  | CanvasAppPrebuiltAssemblySource
  | CanvasAppAssemblyInputSource

export type CanvasAppPrebuiltAssemblySource = {
  assembly?: CanvasAppAssembly
  assemblyInput?: undefined
}

export type CanvasAppAssemblyInputSource = {
  assembly?: undefined
  assemblyInput?: CanvasAppAssemblyInput
}

export type CanvasAppAssemblyRequiredInputSource = {
  assembly?: undefined
  assemblyInput: CanvasAppAssemblyInput
}

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput<
  TEffect,
  TResult,
> = Readonly<{
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource<
      TEffect,
      TResult
    >
  source?: CanvasAppAssemblySource
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['actionKind']
  applied: true
  application:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >
  assemblyInput: CanvasAppAssemblyInput
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblyRequiredInputSource
  status: 'applied'
  update:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['update']
  updateMode:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['updateMode']
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['actionKind']
  applied: false
  application:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >
  assemblyInput: CanvasAppAssemblyInput
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['holdReason']
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblySource
  status: 'held'
  update: null
  updateMode:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['updateMode']
}>

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

export type CanvasAppAssemblySourceValue = {
  assembly?: CanvasAppAssembly
  assemblyInput?: CanvasAppAssemblyInput
}

export function resolveCanvasAppAssemblySource({
  assembly,
  assemblyInput,
}: CanvasAppAssemblySourceValue = {}) {
  if (assembly && assemblyInput) {
    throw new Error(
      'CanvasApp accepts either assembly or assemblyInput, not both',
    )
  }

  return assembly ?? createCanvasAppAssembly(assemblyInput)
}
