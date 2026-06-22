import type {
  CanvasAppFeaturePackMarketplaceItem,
  CanvasAppFeaturePackMarketplacePrimaryAction,
  CanvasAppFeaturePackMarketplaceTarget,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor,
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyCommitContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyResultContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchContracts'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput<
  TEffect,
  TResult,
> = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  cleanupHandlers?:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
      TEffect
    >[]
  executeCleanupEffect:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor<
      TEffect,
      TResult
    >
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
}>

export type CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput<
    TEffect,
    TResult
  >,
  'action'
> & Readonly<{
  item: CanvasAppFeaturePackMarketplaceItem
}>

export type CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput<
    TEffect,
    TResult
  >,
  'action'
> & Readonly<{
  target: CanvasAppFeaturePackMarketplaceTarget
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
  TEffect,
  TResult,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
    TEffect,
    TResult
  > & Readonly<{
    hostUpdate:
      CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult<
        TEffect,
        TResult
      >
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
  TEffect,
  TResult,
> = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyResult
  commitPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<TEffect, TResult>
  commitResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<TEffect, TResult>
  executionPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<TEffect>
  executionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
      TEffect,
      TResult
    >
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
  runtimeStatePatch:
    CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult<
      TEffect,
      TResult
    >
  status: CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus
  summary: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>
