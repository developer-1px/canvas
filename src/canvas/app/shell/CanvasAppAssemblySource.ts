import {
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  createCanvasAppAssembly,
  executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
  type CanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
} from '../workflow'
import {
  getCanvasAppFeaturePackMarketplaceTargetControl,
  getCanvasAppFeaturePackMarketplaceSelectionTargetControl,
  type CanvasAppFeaturePackMarketplaceSelectionExecutionModel,
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

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
    TEffect,
    TResult
  >,
  'control'
> & Readonly<{
  execution: CanvasAppFeaturePackMarketplaceSelectionExecutionModel
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus =
  | 'applied'
  | 'empty'
  | 'held'
  | 'partial'

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary =
  Readonly<{
    appliedResultCount: number
    attemptedControlCount: number
    blockedControlCount: number
    controlCount: number
    heldResultCount: number
    missingResultCount: number
    readyControlCount: number
    skippedControlCount: number
    staleResultCount: number
    unappliedResultCount: number
  }>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
  TEffect,
  TResult,
> = Readonly<{
  applied: boolean
  appliedResults:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
      TEffect,
      TResult
    >[]
  blockedControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  execution: CanvasAppFeaturePackMarketplaceSelectionExecutionModel
  heldResults:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
      TEffect,
      TResult
    >[]
  initialSource: CanvasAppAssemblySource
  missingResults:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult[]
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
  readyControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
  results:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >[]
  skippedControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
  source: CanvasAppAssemblySource
  staleResults:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult[]
  status:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus
  summary:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary
  targets: readonly CanvasAppFeaturePackMarketplaceTarget[]
  unappliedResults:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >[]
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult =
  Readonly<{
    actionKind: CanvasAppFeaturePackMarketplaceTargetControl['actionKind']
    applied: false
    control: CanvasAppFeaturePackMarketplaceTargetControl
    expectedActionKind: CanvasAppFeaturePackMarketplaceTargetControl[
      'actionKind'
    ]
    holdReason: 'stale-target-action'
    hostUpdate: null
    source: CanvasAppAssemblySource
    sourceResult: null
    status: 'stale-target-action'
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

function getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
  TEffect,
  TResult,
>({
  currentModel,
  execution,
  initialSource,
  model,
  results,
  source,
}: {
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  execution: CanvasAppFeaturePackMarketplaceSelectionExecutionModel
  initialSource: CanvasAppAssemblySource
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
  results:
    readonly CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >[]
  source: CanvasAppAssemblySource
}): CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
  TEffect,
  TResult
> {
  const appliedResults = Object.freeze(results.filter(
    isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionAppliedResult,
  ))
  const heldResults = Object.freeze(results.filter(
    isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionHeldResult,
  ))
  const missingResults = Object.freeze(results.filter(
    isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionMissingResult,
  ))
  const staleResults = Object.freeze(results.filter(
    isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleResult,
  ))
  const unappliedResults = Object.freeze(results.filter((result) =>
    !result.applied
  ))
  const skippedControls = execution.heldControls
  const summary = Object.freeze({
    appliedResultCount: appliedResults.length,
    attemptedControlCount: results.length,
    blockedControlCount: execution.blockedControls.length,
    controlCount: execution.controls.length,
    heldResultCount: heldResults.length,
    missingResultCount: missingResults.length,
    readyControlCount: execution.readyControls.length,
    skippedControlCount: skippedControls.length,
    staleResultCount: staleResults.length,
    unappliedResultCount: unappliedResults.length,
  })

  return Object.freeze({
    applied: appliedResults.length > 0,
    appliedResults,
    blockedControls: execution.blockedControls,
    currentModel,
    execution,
    heldResults,
    initialSource,
    missingResults,
    model,
    readyControls: execution.readyControls,
    results: Object.freeze([...results]),
    skippedControls,
    source,
    staleResults,
    status:
      getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus(
        summary,
      ),
    summary,
    targets: execution.readyTargets,
    unappliedResults,
  })
}

function getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus(
  summary:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary,
):
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus {
  if (summary.controlCount === 0) {
    return 'empty'
  }

  if (summary.appliedResultCount === 0) {
    return 'held'
  }

  if (
    summary.skippedControlCount > 0 ||
    summary.unappliedResultCount > 0
  ) {
    return 'partial'
  }

  return 'applied'
}

function getCanvasAppFeaturePackMarketplaceAssemblyModelFromSource({
  model,
  source,
}: {
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
  source: CanvasAppAssemblyRequiredInputSource
}): CanvasAppFeaturePackMarketplaceAssemblyModel {
  return getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput: source.assemblyInput,
    listings: model.listings,
    profiles: model.profiles,
    suiteManifests: model.suiteManifests,
  })
}

function createCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleTargetActionResult({
  control,
  expectedActionKind,
  source,
}: {
  control: CanvasAppFeaturePackMarketplaceTargetControl
  expectedActionKind: CanvasAppFeaturePackMarketplaceTargetControl['actionKind']
  source: CanvasAppAssemblySource
}): CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult {
  return Object.freeze({
    actionKind: control.actionKind,
    applied: false,
    control,
    expectedActionKind,
    holdReason: 'stale-target-action',
    hostUpdate: null,
    source,
    sourceResult: null,
    status: 'stale-target-action',
    target: snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget(
      control.target,
    ),
    transactionResult: null,
    update: null,
    updateMode: 'blocked',
  })
}

function isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionAppliedResult<
  TEffect,
  TResult,
>(
  result:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >,
): result is CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
  TEffect,
  TResult
> {
  return result.applied
}

function isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionHeldResult<
  TEffect,
  TResult,
>(
  result:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >,
): result is CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
  TEffect,
  TResult
> {
  return result.status === 'held'
}

function isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionMissingResult<
  TEffect,
  TResult,
>(
  result:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >,
): result is CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult {
  return result.status === 'missing'
}

function isCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleResult<
  TEffect,
  TResult,
>(
  result:
    CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult<
      TEffect,
      TResult
    >,
): result is CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult {
  return result.status === 'stale-target-action'
}
