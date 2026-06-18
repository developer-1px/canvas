import {
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  createCanvasAppAssembly,
  executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction,
  type CanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
} from '../workflow'
import {
  getCanvasAppFeaturePackMarketplaceSelectionTargetControl,
  type CanvasAppFeaturePackMarketplaceSelectionControlModel,
  type CanvasAppFeaturePackMarketplaceTarget,
  type CanvasAppFeaturePackMarketplaceTargetControl,
} from '../feature-packs'

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

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
  TEffect,
  TResult,
> = CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput<
  TEffect,
  TResult
> & Readonly<{
  source?: CanvasAppAssemblySource
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
    TEffect,
    TResult
  >,
  'target'
> & Readonly<{
  control: CanvasAppFeaturePackMarketplaceTargetControl
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult =
  Readonly<{
    actionKind: null
    applied: false
    control: CanvasAppFeaturePackMarketplaceTargetControl
    holdReason: 'missing-target'
    hostUpdate: null
    source: CanvasAppAssemblySource
    sourceResult: null
    status: 'missing'
    target: CanvasAppFeaturePackMarketplaceTargetControl['target']
    transactionResult: null
    update: null
    updateMode: 'blocked'
  }>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
    TEffect,
    TResult
  >,
  'control'
> & Readonly<{
  selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
  target: CanvasAppFeaturePackMarketplaceTarget
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult =
  Readonly<{
    actionKind: null
    applied: false
    control: null
    holdReason: 'missing-selection-target'
    hostUpdate: null
    selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
    source: CanvasAppAssemblySource
    sourceResult: null
    status: 'missing-selection-target'
    target: CanvasAppFeaturePackMarketplaceTarget
    transactionResult: null
    update: null
    updateMode: 'blocked'
  }>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['actionKind']
  applied: true
  hostUpdate:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblyRequiredInputSource
  sourceResult:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >
  status: 'applied'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
      TEffect,
      TResult
    >
  update:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['update']
  updateMode:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['updateMode']
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['actionKind']
  applied: false
  holdReason:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['holdReason']
  hostUpdate:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblySource
  sourceResult:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >
  status: 'held'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
      TEffect,
      TResult
    >
  update: null
  updateMode:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
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

function snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasAppFeaturePackMarketplaceTarget {
  if (target.kind === 'pack') {
    return Object.freeze({
      featurePackId: target.featurePackId,
      kind: 'pack',
    })
  }

  if (target.kind === 'profile') {
    return Object.freeze({
      kind: 'profile',
      profileId: target.profileId,
    })
  }

  return Object.freeze({
    kind: 'suite',
    suiteId: target.suiteId,
  })
}
