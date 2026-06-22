import type {
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  CanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'
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
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyResultContracts'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanStatus =
  | 'blocked'
  | 'needs-cleanup-handler'
  | 'ready'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus =
  | 'blocked'
  | 'cleanup-failed'
  | 'completed'
  | 'needs-cleanup-handler'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus =
  | 'not-run'
  | CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput<
  TEffect,
> = Readonly<{
  applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyResult
  cleanupHandlers?:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
      TEffect
    >[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
  TEffect,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan
  | CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan<
    TEffect
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan<TEffect>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput<
  TEffect,
  TResult,
> = Readonly<{
  executeCleanupEffect:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor<
      TEffect,
      TResult
    >
  executionPlan:
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<TEffect>
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult
  | CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput<
  TEffect,
  TResult,
> = Readonly<{
  executionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
      TEffect,
      TResult
    >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary =
  Readonly<{
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    blockedReasonCount: number
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    cleanup:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary
    marketplaceBlockedReasonCount: number
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus
    totalBlockedReasonCount: number
    uninstallDataPlan:
      CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary =
  Readonly<{
    effectCount: number
    failedScopeCount: number
    failedScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    handledScopeCount: number
    handledScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    missingHandlerScopeCount: number
    missingHandlerScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    skippedScopeCount: number
    skippedScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    status:
      CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus
    succeededScopeCount: number
    succeededScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan<
  TEffect,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionPlan<
    TEffect,
    'ready'
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan<
  TEffect,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionPlan<
    TEffect,
    'needs-cleanup-handler'
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan =
  Readonly<{
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult
    blockedReasonCount: number
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
    marketplaceBlockedReasonCount: number
    status: 'blocked'
    totalBlockedReasonCount: number
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    updateMode: 'blocked'
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult =
  Readonly<{
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult
    blockedReasonCount: number
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
    executionPlan:
      CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan
    marketplaceBlockedReasonCount: number
    status: 'blocked'
    totalBlockedReasonCount: number
    uninstallDataPlan:
      CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    updateMode: 'blocked'
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult<
  TEffect,
  TResult,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionResult<
    TEffect,
    TResult,
    'completed'
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult<
  TEffect,
  TResult,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionResult<
    TEffect,
    TResult,
    'cleanup-failed'
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult<
  TEffect,
  TResult,
> =
  CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionResult<
    TEffect,
    TResult,
    'needs-cleanup-handler'
  >

type CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionPlan<
  TEffect,
  TStatus extends 'needs-cleanup-handler' | 'ready',
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult
  cleanupEffectPlan:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<TEffect>
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  status: TStatus
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

type CanvasAppFeaturePackMarketplaceAssemblyApplyRunnableExecutionResult<
  TEffect,
  TResult,
  TStatus extends 'cleanup-failed' | 'completed' | 'needs-cleanup-handler',
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  applyResult: CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult
  cleanupExecutionResult:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
      TEffect,
      TResult
    >
  currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  executionPlan:
    | CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan<
      TEffect
    >
    | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan<TEffect>
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  status: TStatus
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>
