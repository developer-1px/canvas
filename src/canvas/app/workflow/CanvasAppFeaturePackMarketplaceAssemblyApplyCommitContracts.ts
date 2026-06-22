import type {
  CanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionContracts'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus =
  | 'blocked'
  | 'cleanup-failed'
  | 'needs-cleanup-handler'
  | 'ready-to-commit'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus =
  | 'committed'
  | 'held'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput<
  TEffect,
  TResult,
> = Readonly<{
  executionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
      TEffect,
      TResult
    >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan<TEffect, TResult>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput<
  TEffect,
  TResult,
> = Readonly<{
  commitPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<TEffect, TResult>
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  canCommit: true
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  executionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult<
      TEffect,
      TResult
    >
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  status: 'ready-to-commit'
  summary: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  canCommit: false
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  executionResult:
    | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult
    | CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult<
      TEffect,
      TResult
    >
    | CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult<
      TEffect,
      TResult
    >
  status: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus,
    'ready-to-commit'
  >
  summary: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  commitPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan<TEffect, TResult>
  committed: true
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  previousAssemblyInput: CanvasAppFeaturePackAssemblyInput
  previousModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  status: 'committed'
  summary: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  commitPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan<TEffect, TResult>
  committed: false
  currentAssemblyInput: CanvasAppFeaturePackAssemblyInput
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan<
      TEffect,
      TResult
    >['status']
  status: 'held'
  summary: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>
