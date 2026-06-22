import {
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppFeaturePackMarketplaceAssemblyModel,
} from '../workflow'
import {
  snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget,
} from './CanvasAppAssemblySourceMarketplaceTargets'
import type {
  CanvasAppAssemblyRequiredInputSource,
  CanvasAppAssemblySource,
} from './CanvasAppAssemblySourceContracts'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStaleTargetActionResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStepResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionSummary,
} from './CanvasAppAssemblySourceMarketplaceSelectionExecutionContracts'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult,
} from './CanvasAppAssemblySourceMarketplaceTargetTransactionContracts'
import type {
  CanvasAppFeaturePackMarketplaceSelectionExecutionModel,
  CanvasAppFeaturePackMarketplaceTargetControl,
} from '../feature-packs'

export function getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionResult<
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

export function getCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionApplyTransactionStatus(
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

export function getCanvasAppFeaturePackMarketplaceAssemblyModelFromSource({
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

export function createCanvasAppAssemblySourceFeaturePackMarketplaceSelectionExecutionStaleTargetActionResult({
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
