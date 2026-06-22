import type {
  CanvasAppFeaturePackMarketplaceSelectionExecutionModel,
  CanvasAppFeaturePackMarketplaceTarget,
  CanvasAppFeaturePackMarketplaceTargetControl,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from '../workflow'
import type { CanvasAppAssemblySource } from './CanvasAppAssemblySourceContracts'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult,
} from './CanvasAppAssemblySourceMarketplaceTargetTransactionContracts'

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
