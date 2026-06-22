import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan'

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus =
  | 'empty'
  | 'needs-handler'
  | 'ready'

export type CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
  TEffect,
> = Readonly<{
  createEffect: (
    input: CanvasAppFeaturePackMarketplaceUninstallCleanupEffectInput,
  ) => TEffect
  scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectInput =
  Readonly<{
    featurePackIds: readonly CanvasAppFeaturePackId[]
    scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
    uninstallDataPlan:
      CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
  }>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<
  TEffect,
> = Readonly<{
  effect: TEffect
  featurePackIds: readonly CanvasAppFeaturePackId[]
  scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput<
  TEffect,
> = Readonly<{
  handlers?:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
      TEffect
    >[]
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<
  TEffect,
> = Readonly<{
  effects:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>[]
  handledScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  hostManagedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  hostManagedScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  missingHandlerScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  preserveFeaturePackIds: readonly CanvasAppFeaturePackId[]
  preserveScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeFeaturePackIds: readonly CanvasAppFeaturePackId[]
  removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  status: CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus
  unscopedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus =
  | 'empty'
  | 'failed'
  | 'needs-handler'
  | 'succeeded'

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor<
  TEffect,
  TResult,
> = (
  effect: CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>,
) => Promise<TResult> | TResult

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput<
  TEffect,
  TResult,
> = Readonly<{
  cleanupEffectPlan:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<TEffect>
  executeEffect:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor<
      TEffect,
      TResult
    >
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
    TEffect
  >
  | CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
  TEffect,
> = Readonly<{
  effect: CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>
  error: unknown
  featurePackIds: readonly CanvasAppFeaturePackId[]
  scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
  status: 'failed'
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult<
  TEffect,
  TResult,
> = Readonly<{
  effect: CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>
  featurePackIds: readonly CanvasAppFeaturePackId[]
  scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
  status: 'succeeded'
  value: TResult
}>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult =
  Readonly<{
    featurePackIds: readonly CanvasAppFeaturePackId[]
    reason: 'missing-handler'
    scopeId: CanvasAppFeaturePackManifestOrphanedDataScopeId
    status: 'skipped'
  }>

export type CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult

export type CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
  TEffect,
  TResult,
> = Readonly<{
  cleanupEffectPlan:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<TEffect>
  effectResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
      TEffect,
      TResult
    >[]
  failedResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
      TEffect
    >[]
  failedScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  results:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult<
      TEffect,
      TResult
    >[]
  skippedResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult[]
  skippedScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  status:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus
  succeededResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult<
      TEffect,
      TResult
    >[]
  succeededScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}>
