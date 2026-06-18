import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  createCanvasAppFeaturePackExtensionBundle,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  assertCanvasAppFeaturePackViewRenderers,
  createCanvasAppFeaturePackViewRenderers,
  getCanvasAppFeaturePackProfileById,
  getCanvasAppFeaturePackProfileRuntimeStates,
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppManifestExtensionFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppFeaturePackMarketplaceModel,
  getCanvasAppResolvedFeaturePackStates,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackManifestOrphanedDataScopeId,
  type CanvasAppFeaturePackRuntimeStateInput,
  type CanvasAppFeaturePackSuiteManifest,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppViewFeaturePack,
} from '../feature-packs'
import type {
  CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'

export type CanvasAppFeaturePackAssembly = {
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackExtensionBundle: CanvasAppExtensionBundle
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackViewRenderers: CanvasAppFeaturePackViewRenderers
}

export type CanvasAppFeaturePackAssemblyInput = {
  additionalFeaturePackManifests?: readonly CanvasAppFeaturePackManifest[]
  disabledFeaturePackIds?: CanvasAppFeaturePackInstallOptions[
    'disabledFeaturePackIds'
  ]
  disabledViewFeaturePackIds?: CanvasAppFeaturePackInstallOptions[
    'disabledFeaturePackIds'
  ]
  featurePackStates?: CanvasAppFeaturePackInstallOptions['featurePackStates']
  featurePackManifests?: readonly CanvasAppFeaturePackManifest[]
  featurePackProfile?: CanvasAppFeaturePackProfile
  featurePackProfileId?: CanvasAppFeaturePackProfileId
  featurePackProfiles?: readonly CanvasAppFeaturePackProfile[]
  featurePackViewRenderers?: CanvasAppFeaturePackViewRenderers
  viewFeaturePacks?: readonly CanvasAppViewFeaturePack[]
}

export type CanvasAppFeaturePackMarketplaceActionAssemblyInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
}>

export type CanvasAppFeaturePackMarketplaceActionAssemblyPlan =
  | CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan
  | CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan

export type CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    assemblyInput: CanvasAppFeaturePackAssemblyInput
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'ready'
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export type CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    blockedReasonCount: number
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    marketplaceBlockedReasonCount: number
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'blocked'
    totalBlockedReasonCount: number
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan =
  Readonly<{
    entries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
    hostManagedFeaturePackIds: readonly CanvasAppFeaturePackId[]
    hostManagedScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    preserveFeaturePackIds: readonly CanvasAppFeaturePackId[]
    preserveScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    removeFeaturePackIds: readonly CanvasAppFeaturePackId[]
    removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    unscopedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  }>

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

export type CanvasAppFeaturePackMarketplaceAssemblyModelInput = Readonly<{
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyModel = Readonly<{
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
  installOptions: CanvasAppFeaturePackInstallOptions
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  marketplaceModel: CanvasAppFeaturePackMarketplaceModel
  profiles: readonly CanvasAppFeaturePackProfile[]
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyActionInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode =
  | 'blocked'
  | 'full-rebuild'
  | 'partial-update'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyPlan =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan & Readonly<{
    updateMode: Exclude<
      CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
      'blocked'
    >
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan & Readonly<{
    updateMode: 'blocked'
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyResult =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult =
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan & Readonly<{
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
    nextModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult =
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan & Readonly<{
    currentModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  }>

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

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus =
  | 'blocked'
  | 'cleanup-failed'
  | 'needs-cleanup-handler'
  | 'ready-to-commit'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus =
  | 'committed'
  | 'held'

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

export function createCanvasAppFeaturePackAssembly(
  input: CanvasAppFeaturePackAssemblyInput,
  defaults: CanvasAppFeaturePackAssembly,
): CanvasAppFeaturePackAssembly {
  if (input.featurePackViewRenderers) {
    assertCanvasAppFeaturePackViewRenderers(input.featurePackViewRenderers)
    const featurePackManifests =
      getCanvasAppAssemblyFeaturePackManifests(input)
    const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
      input,
      featurePackManifests,
    )

    return {
      enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackExtensionBundle: createCanvasAppFeaturePackExtensionBundle(
        getCanvasAppManifestExtensionFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
      installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackViewRenderers: snapshotCanvasAppFeaturePackViewRenderers(
        input.featurePackViewRenderers,
      ),
    }
  }

  if (
    input.featurePackManifests ||
    input.additionalFeaturePackManifests ||
    input.disabledFeaturePackIds ||
    input.featurePackProfile ||
    input.featurePackProfileId ||
    input.featurePackStates
  ) {
    const featurePackManifests =
      getCanvasAppAssemblyFeaturePackManifests(input)
    const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
      input,
      featurePackManifests,
    )

    return {
      enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackExtensionBundle: createCanvasAppFeaturePackExtensionBundle(
        getCanvasAppManifestExtensionFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
      installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
        featurePackManifests,
        installOptions,
      ),
      featurePackViewRenderers: createCanvasAppFeaturePackViewRenderers(
        getCanvasAppManifestViewFeaturePacks(
          featurePackManifests,
          installOptions,
        ),
      ),
    }
  }

  if (input.viewFeaturePacks || input.disabledViewFeaturePackIds) {
    return {
      enabledFeaturePackIds: defaults.enabledFeaturePackIds,
      featurePackExtensionBundle: defaults.featurePackExtensionBundle,
      installedFeaturePackIds: defaults.installedFeaturePackIds,
      featurePackViewRenderers: createCanvasAppFeaturePackViewRenderers(
        input.viewFeaturePacks ?? DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
        {
          disabledFeaturePackIds: input.disabledViewFeaturePackIds,
        },
      ),
    }
  }

  return defaults
}

export function getCanvasAppFeaturePackMarketplaceAssemblyModel({
  assemblyInput = {},
  listings = [],
  profiles,
  suiteManifests,
}: CanvasAppFeaturePackMarketplaceAssemblyModelInput = {}):
  CanvasAppFeaturePackMarketplaceAssemblyModel {
  const featurePackManifests = snapshotCanvasAppFeaturePackManifests(
    getCanvasAppAssemblyFeaturePackManifests(assemblyInput),
  )
  const installOptions =
    getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
      assemblyInput,
      featurePackManifests,
    })
  const canonicalAssemblyInput =
    getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
      assemblyInput,
      installOptions,
    })
  const marketplaceListings =
    snapshotCanvasAppFeaturePackMarketplaceListings(listings)
  const marketplaceProfiles = snapshotCanvasAppFeaturePackProfiles(
    profiles ?? assemblyInput.featurePackProfiles ??
      DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  )
  const marketplaceSuiteManifests = snapshotCanvasAppFeaturePackSuiteManifests(
    suiteManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  )

  return Object.freeze({
    assemblyInput: canonicalAssemblyInput,
    featurePackManifests,
    installOptions,
    listings: marketplaceListings,
    marketplaceModel: getCanvasAppFeaturePackMarketplaceModel({
      listings: marketplaceListings,
      manifests: featurePackManifests,
      options: installOptions,
      profiles: marketplaceProfiles,
      suiteManifests: marketplaceSuiteManifests,
    }),
    profiles: marketplaceProfiles,
    suiteManifests: marketplaceSuiteManifests,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyResult(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyResult {
  const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(input)

  if (applyPlan.status === 'blocked') {
    return Object.freeze({
      ...applyPlan,
      currentModel: input.model,
    })
  }

  return Object.freeze({
    ...applyPlan,
    currentModel: input.model,
    nextModel: getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: applyPlan.assemblyInput,
      listings: input.model.listings,
      profiles: input.model.profiles,
      suiteManifests: input.model.suiteManifests,
    }),
  })
}

export function createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
  TEffect,
>({
  applyResult,
  cleanupHandlers = [],
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput<TEffect>):
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<TEffect> {
  if (applyResult.status === 'blocked') {
    return Object.freeze({
      actionKind: applyResult.actionKind,
      applyResult,
      blockedReasonCount: applyResult.blockedReasonCount,
      currentModel: applyResult.currentModel,
      marketplaceBlockedReasonCount: applyResult.marketplaceBlockedReasonCount,
      status: 'blocked',
      totalBlockedReasonCount: applyResult.totalBlockedReasonCount,
      uninstallDataPlan: applyResult.uninstallDataPlan,
      updateMode: 'blocked',
    })
  }

  const cleanupEffectPlan =
    createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
      handlers: cleanupHandlers,
      uninstallDataPlan: applyResult.uninstallDataPlan,
    })

  return Object.freeze({
    actionKind: applyResult.actionKind,
    applyResult,
    cleanupEffectPlan,
    currentModel: applyResult.currentModel,
    nextAssemblyInput: applyResult.assemblyInput,
    nextModel: applyResult.nextModel,
    status: cleanupEffectPlan.status === 'needs-handler'
      ? 'needs-cleanup-handler'
      : 'ready',
    uninstallDataPlan: applyResult.uninstallDataPlan,
    updateMode: applyResult.updateMode,
  })
}

export async function executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan<
  TEffect,
  TResult,
>({
  executeCleanupEffect,
  executionPlan,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput<
  TEffect,
  TResult
>):
  Promise<
    CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult<
      TEffect,
      TResult
    >
  > {
  if (executionPlan.status === 'blocked') {
    return Object.freeze({
      actionKind: executionPlan.actionKind,
      applyResult: executionPlan.applyResult,
      blockedReasonCount: executionPlan.blockedReasonCount,
      currentModel: executionPlan.currentModel,
      executionPlan,
      marketplaceBlockedReasonCount:
        executionPlan.marketplaceBlockedReasonCount,
      status: 'blocked',
      totalBlockedReasonCount: executionPlan.totalBlockedReasonCount,
      uninstallDataPlan: executionPlan.uninstallDataPlan,
      updateMode: 'blocked',
    })
  }

  const cleanupExecutionResult =
    await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
      cleanupEffectPlan: executionPlan.cleanupEffectPlan,
      executeEffect: executeCleanupEffect,
    })

  return Object.freeze({
    actionKind: executionPlan.actionKind,
    applyResult: executionPlan.applyResult,
    cleanupExecutionResult,
    currentModel: executionPlan.currentModel,
    executionPlan,
    nextAssemblyInput: executionPlan.nextAssemblyInput,
    nextModel: executionPlan.nextModel,
    status:
      getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus(
        cleanupExecutionResult.status,
      ),
    uninstallDataPlan: executionPlan.uninstallDataPlan,
    updateMode: executionPlan.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary<
  TEffect,
  TResult,
>({
  executionResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary {
  if (executionResult.status === 'blocked') {
    return Object.freeze({
      actionKind: executionResult.actionKind,
      blockedReasonCount: executionResult.blockedReasonCount,
      changedFeaturePackIds:
        Object.freeze([...executionResult.applyResult.changedFeaturePackIds]),
      cleanup:
        getCanvasAppFeaturePackMarketplaceAssemblyApplyNotRunCleanupSummary(),
      marketplaceBlockedReasonCount:
        executionResult.marketplaceBlockedReasonCount,
      partialUpdateSurfaceIds:
        Object.freeze([...executionResult.applyResult.partialUpdateSurfaceIds]),
      status: executionResult.status,
      totalBlockedReasonCount: executionResult.totalBlockedReasonCount,
      uninstallDataPlan: executionResult.uninstallDataPlan,
      updateMode: executionResult.updateMode,
    })
  }

  return Object.freeze({
    actionKind: executionResult.actionKind,
    blockedReasonCount: 0,
    changedFeaturePackIds:
      Object.freeze([...executionResult.applyResult.changedFeaturePackIds]),
    cleanup:
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCleanupExecutionSummary(
        executionResult.cleanupExecutionResult,
      ),
    marketplaceBlockedReasonCount: 0,
    partialUpdateSurfaceIds:
      Object.freeze([...executionResult.applyResult.partialUpdateSurfaceIds]),
    status: executionResult.status,
    totalBlockedReasonCount: 0,
    uninstallDataPlan: executionResult.uninstallDataPlan,
    updateMode: executionResult.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<
  TEffect,
  TResult,
>({
  executionResult,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan<TEffect, TResult> {
  const summary =
    getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult,
    })

  if (executionResult.status === 'completed') {
    return Object.freeze({
      actionKind: executionResult.actionKind,
      canCommit: true,
      currentModel: executionResult.currentModel,
      executionResult,
      nextAssemblyInput: executionResult.nextAssemblyInput,
      nextModel: executionResult.nextModel,
      status: 'ready-to-commit',
      summary,
      uninstallDataPlan: executionResult.uninstallDataPlan,
      updateMode: executionResult.updateMode,
    })
  }

  return Object.freeze({
    actionKind: executionResult.actionKind,
    canCommit: false,
    currentModel: executionResult.currentModel,
    executionResult,
    status: executionResult.status,
    summary,
    uninstallDataPlan: executionResult.uninstallDataPlan,
    updateMode: executionResult.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<
  TEffect,
  TResult,
>({
  commitPlan,
}: CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput<
  TEffect,
  TResult
>): CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<TEffect, TResult> {
  if (commitPlan.canCommit) {
    return Object.freeze({
      actionKind: commitPlan.actionKind,
      commitPlan,
      committed: true,
      nextAssemblyInput: commitPlan.nextAssemblyInput,
      nextModel: commitPlan.nextModel,
      previousAssemblyInput: commitPlan.currentModel.assemblyInput,
      previousModel: commitPlan.currentModel,
      status: 'committed',
      summary: commitPlan.summary,
      uninstallDataPlan: commitPlan.uninstallDataPlan,
      updateMode: commitPlan.updateMode,
    })
  }

  return Object.freeze({
    actionKind: commitPlan.actionKind,
    commitPlan,
    committed: false,
    currentAssemblyInput: commitPlan.currentModel.assemblyInput,
    currentModel: commitPlan.currentModel,
    holdReason: commitPlan.status,
    status: 'held',
    summary: commitPlan.summary,
    uninstallDataPlan: commitPlan.uninstallDataPlan,
    updateMode: commitPlan.updateMode,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyPlan {
  const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan(input)

  if (actionPlan.status === 'blocked') {
    return Object.freeze({
      ...actionPlan,
      updateMode: 'blocked',
    })
  }

  return Object.freeze({
    ...actionPlan,
    updateMode: actionPlan.partialUpdateSurfaceIds.length > 0
      ? 'partial-update'
      : 'full-rebuild',
  })
}

export function createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<
  TEffect,
>({
  handlers = [],
  uninstallDataPlan,
}: CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput<TEffect>):
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<TEffect> {
  const handlerByScopeId =
    getCanvasAppFeaturePackMarketplaceUninstallCleanupHandlerMap(handlers)
  const featurePackIdsByScopeId =
    getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId(
      uninstallDataPlan,
    )
  const effects:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffect<TEffect>[] = []
  const handledScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const missingHandlerScopeIds:
    CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []

  for (const scopeId of uninstallDataPlan.removeScopeIds) {
    const handler = handlerByScopeId.get(scopeId)
    const featurePackIds = featurePackIdsByScopeId.get(scopeId) ?? []

    if (!handler) {
      missingHandlerScopeIds.push(scopeId)
      continue
    }

    const effect = handler.createEffect({
      featurePackIds: Object.freeze([...featurePackIds]),
      scopeId,
      uninstallDataPlan,
    })

    effects.push(Object.freeze({
      effect,
      featurePackIds: Object.freeze([...featurePackIds]),
      scopeId,
    }))
    handledScopeIds.push(scopeId)
  }

  return Object.freeze({
    effects: Object.freeze(effects),
    handledScopeIds: Object.freeze(handledScopeIds),
    hostManagedFeaturePackIds:
      Object.freeze([...uninstallDataPlan.hostManagedFeaturePackIds]),
    hostManagedScopeIds:
      Object.freeze([...uninstallDataPlan.hostManagedScopeIds]),
    missingHandlerScopeIds: Object.freeze(missingHandlerScopeIds),
    preserveFeaturePackIds:
      Object.freeze([...uninstallDataPlan.preserveFeaturePackIds]),
    preserveScopeIds: Object.freeze([...uninstallDataPlan.preserveScopeIds]),
    removeFeaturePackIds:
      Object.freeze([...uninstallDataPlan.removeFeaturePackIds]),
    removeScopeIds: Object.freeze([...uninstallDataPlan.removeScopeIds]),
    status:
      getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus({
        handledScopeIds,
        missingHandlerScopeIds,
        removeScopeIds: uninstallDataPlan.removeScopeIds,
      }),
    unscopedFeaturePackIds:
      Object.freeze([...uninstallDataPlan.unscopedFeaturePackIds]),
    uninstallDataPlan,
  })
}

export async function executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan<
  TEffect,
  TResult,
>({
  cleanupEffectPlan,
  executeEffect,
}: CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput<
  TEffect,
  TResult
>):
  Promise<
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
      TEffect,
      TResult
    >
  > {
  const effectResults:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
      TEffect,
      TResult
    >[] = []
  const failedResults:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
      TEffect
    >[] = []
  const skippedResults:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult[]
      = []
  const succeededResults:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult<
      TEffect,
      TResult
    >[] = []
  const results:
    CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult<
      TEffect,
      TResult
    >[] = []

  for (const effect of cleanupEffectPlan.effects) {
    try {
      const value = await executeEffect(effect)
      const result = Object.freeze({
        effect,
        featurePackIds: Object.freeze([...effect.featurePackIds]),
        scopeId: effect.scopeId,
        status: 'succeeded' as const,
        value,
      })

      effectResults.push(result)
      succeededResults.push(result)
      results.push(result)
    } catch (error) {
      const result = Object.freeze({
        effect,
        error,
        featurePackIds: Object.freeze([...effect.featurePackIds]),
        scopeId: effect.scopeId,
        status: 'failed' as const,
      })

      effectResults.push(result)
      failedResults.push(result)
      results.push(result)
    }
  }

  const featurePackIdsByScopeId =
    getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId(
      cleanupEffectPlan.uninstallDataPlan,
    )

  for (const scopeId of cleanupEffectPlan.missingHandlerScopeIds) {
    const result = Object.freeze({
      featurePackIds: Object.freeze([
        ...(featurePackIdsByScopeId.get(scopeId) ?? []),
      ]),
      reason: 'missing-handler' as const,
      scopeId,
      status: 'skipped' as const,
    })

    skippedResults.push(result)
    results.push(result)
  }

  return Object.freeze({
    cleanupEffectPlan,
    effectResults: Object.freeze(effectResults),
    failedResults: Object.freeze(failedResults),
    failedScopeIds: Object.freeze(
      failedResults.map((result) => result.scopeId),
    ),
    results: Object.freeze(results),
    skippedResults: Object.freeze(skippedResults),
    skippedScopeIds: Object.freeze(
      skippedResults.map((result) => result.scopeId),
    ),
    status:
      getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus({
        effectResults,
        failedResults,
        skippedResults,
      }),
    succeededResults: Object.freeze(succeededResults),
    succeededScopeIds: Object.freeze(
      succeededResults.map((result) => result.scopeId),
    ),
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  const plan = getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput,
  })

  if (plan.status !== 'ready') {
    throw new Error(
      `Canvas app feature pack marketplace action is not ready: ${action.kind}`,
    )
  }

  return plan.assemblyInput
}

export function getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  const uninstallDataPlan =
    getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
      action.uninstallPolicyEntries,
    )

  if (!action.ready) {
    const blockedReasonCount = action.blockedReasons.length
    const marketplaceBlockedReasonCount = action.marketplaceBlockedReasons.length

    return Object.freeze({
      action,
      actionKind: action.kind,
      blockedReasonCount,
      changedFeaturePackIds: action.changedFeaturePackIds,
      marketplaceBlockedReasonCount,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      status: 'blocked',
      totalBlockedReasonCount:
        blockedReasonCount + marketplaceBlockedReasonCount,
      uninstallDataPlan,
      uninstallPolicyEntries: action.uninstallPolicyEntries,
    })
  }

  return Object.freeze({
    action,
    actionKind: action.kind,
    assemblyInput: getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
      action,
      assemblyInput,
    }),
    changedFeaturePackIds: action.changedFeaturePackIds,
    partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
    status: 'ready',
    uninstallDataPlan,
    uninstallPolicyEntries: action.uninstallPolicyEntries,
  })
}

function getCanvasAppFeaturePackMarketplaceUninstallCleanupHandlerMap<TEffect>(
  handlers:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<
      TEffect
    >[],
): ReadonlyMap<
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<TEffect>
> {
  const handlerByScopeId = new Map<
    CanvasAppFeaturePackManifestOrphanedDataScopeId,
    CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler<TEffect>
  >()

  for (const handler of handlers) {
    if (handlerByScopeId.has(handler.scopeId)) {
      throw new Error(
        `Duplicate canvas app feature pack uninstall cleanup handler: ${handler.scopeId}`,
      )
    }

    handlerByScopeId.set(handler.scopeId, handler)
  }

  return handlerByScopeId
}

function getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId(
  uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
): ReadonlyMap<
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  readonly CanvasAppFeaturePackId[]
> {
  const featurePackIdsByScopeId = new Map<
    CanvasAppFeaturePackManifestOrphanedDataScopeId,
    CanvasAppFeaturePackId[]
  >()

  for (const entry of uninstallDataPlan.entries) {
    if (entry.orphanedDataPolicy !== 'remove') {
      continue
    }

    for (const scopeId of entry.orphanedDataScopeIds) {
      const featurePackIds = featurePackIdsByScopeId.get(scopeId) ?? []

      appendCanvasAppFeaturePackMarketplaceUniqueId(
        featurePackIds,
        entry.featurePackId,
      )
      featurePackIdsByScopeId.set(scopeId, featurePackIds)
    }
  }

  return featurePackIdsByScopeId
}

function getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus({
  handledScopeIds,
  missingHandlerScopeIds,
  removeScopeIds,
}: {
  handledScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  missingHandlerScopeIds:
    readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}): CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus {
  if (removeScopeIds.length === 0 && handledScopeIds.length === 0) {
    return 'empty'
  }

  if (missingHandlerScopeIds.length > 0) {
    return 'needs-handler'
  }

  return 'ready'
}

function getCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus<
  TEffect,
  TResult,
>({
  effectResults,
  failedResults,
  skippedResults,
}: {
  effectResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult<
      TEffect,
      TResult
    >[]
  failedResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult<
      TEffect
    >[]
  skippedResults:
    readonly CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult[]
}): CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus {
  if (failedResults.length > 0) {
    return 'failed'
  }

  if (skippedResults.length > 0) {
    return 'needs-handler'
  }

  if (effectResults.length === 0) {
    return 'empty'
  }

  return 'succeeded'
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus(
  cleanupExecutionStatus:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
): Exclude<
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus,
  'blocked'
> {
  if (cleanupExecutionStatus === 'failed') {
    return 'cleanup-failed'
  }

  if (cleanupExecutionStatus === 'needs-handler') {
    return 'needs-cleanup-handler'
  }

  return 'completed'
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyCleanupExecutionSummary<
  TEffect,
  TResult,
>(
  cleanupExecutionResult:
    CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult<
      TEffect,
      TResult
    >,
): CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary {
  return Object.freeze({
    effectCount: cleanupExecutionResult.cleanupEffectPlan.effects.length,
    failedScopeCount: cleanupExecutionResult.failedScopeIds.length,
    failedScopeIds: Object.freeze([
      ...cleanupExecutionResult.failedScopeIds,
    ]),
    handledScopeCount:
      cleanupExecutionResult.cleanupEffectPlan.handledScopeIds.length,
    handledScopeIds: Object.freeze([
      ...cleanupExecutionResult.cleanupEffectPlan.handledScopeIds,
    ]),
    missingHandlerScopeCount:
      cleanupExecutionResult.cleanupEffectPlan.missingHandlerScopeIds.length,
    missingHandlerScopeIds: Object.freeze([
      ...cleanupExecutionResult.cleanupEffectPlan.missingHandlerScopeIds,
    ]),
    skippedScopeCount: cleanupExecutionResult.skippedScopeIds.length,
    skippedScopeIds: Object.freeze([
      ...cleanupExecutionResult.skippedScopeIds,
    ]),
    status: cleanupExecutionResult.status,
    succeededScopeCount: cleanupExecutionResult.succeededScopeIds.length,
    succeededScopeIds: Object.freeze([
      ...cleanupExecutionResult.succeededScopeIds,
    ]),
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyApplyNotRunCleanupSummary():
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary {
  return Object.freeze({
    effectCount: 0,
    failedScopeCount: 0,
    failedScopeIds: Object.freeze([]),
    handledScopeCount: 0,
    handledScopeIds: Object.freeze([]),
    missingHandlerScopeCount: 0,
    missingHandlerScopeIds: Object.freeze([]),
    skippedScopeCount: 0,
    skippedScopeIds: Object.freeze([]),
    status: 'not-run',
    succeededScopeCount: 0,
    succeededScopeIds: Object.freeze([]),
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
  entries: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'],
): CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan {
  const hostManagedFeaturePackIds: CanvasAppFeaturePackId[] = []
  const hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const preserveFeaturePackIds: CanvasAppFeaturePackId[] = []
  const preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const removeFeaturePackIds: CanvasAppFeaturePackId[] = []
  const removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const unscopedFeaturePackIds: CanvasAppFeaturePackId[] = []

  for (const entry of entries) {
    const featurePackIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
      entry,
      hostManagedFeaturePackIds,
      preserveFeaturePackIds,
      removeFeaturePackIds,
    })
    const scopeIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
      entry,
      hostManagedScopeIds,
      preserveScopeIds,
      removeScopeIds,
    })

    appendCanvasAppFeaturePackMarketplaceUniqueId(
      featurePackIds,
      entry.featurePackId,
    )

    if (entry.orphanedDataScopeIds.length === 0) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(
        unscopedFeaturePackIds,
        entry.featurePackId,
      )
      continue
    }

    for (const scopeId of entry.orphanedDataScopeIds) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(scopeIds, scopeId)
    }
  }

  return Object.freeze({
    entries: Object.freeze([...entries]),
    hostManagedFeaturePackIds: Object.freeze(hostManagedFeaturePackIds),
    hostManagedScopeIds: Object.freeze(hostManagedScopeIds),
    preserveFeaturePackIds: Object.freeze(preserveFeaturePackIds),
    preserveScopeIds: Object.freeze(preserveScopeIds),
    removeFeaturePackIds: Object.freeze(removeFeaturePackIds),
    removeScopeIds: Object.freeze(removeScopeIds),
    unscopedFeaturePackIds: Object.freeze(unscopedFeaturePackIds),
  })
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
  entry,
  hostManagedFeaturePackIds,
  preserveFeaturePackIds,
  removeFeaturePackIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedFeaturePackIds: CanvasAppFeaturePackId[]
  preserveFeaturePackIds: CanvasAppFeaturePackId[]
  removeFeaturePackIds: CanvasAppFeaturePackId[]
}): CanvasAppFeaturePackId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedFeaturePackIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeFeaturePackIds
  }

  return preserveFeaturePackIds
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
  entry,
  hostManagedScopeIds,
  preserveScopeIds,
  removeScopeIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}): CanvasAppFeaturePackManifestOrphanedDataScopeId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedScopeIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeScopeIds
  }

  return preserveScopeIds
}

function appendCanvasAppFeaturePackMarketplaceUniqueId<TId extends string>(
  ids: TId[],
  id: TId,
) {
  if (!ids.includes(id)) {
    ids.push(id)
  }
}

function getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
    assemblyInput,
    installOptions: action.installOptions,
  })
}

function getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
  assemblyInput,
  installOptions,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  installOptions: CanvasAppFeaturePackInstallOptions
}): CanvasAppFeaturePackAssemblyInput {
  const canonicalAssemblyInput: CanvasAppFeaturePackAssemblyInput = {
    ...assemblyInput,
  }

  delete canonicalAssemblyInput.disabledFeaturePackIds
  delete canonicalAssemblyInput.featurePackProfile
  delete canonicalAssemblyInput.featurePackProfileId

  return Object.freeze({
    ...canonicalAssemblyInput,
    featurePackStates: installOptions.featurePackStates,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
  assemblyInput,
  featurePackManifests,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
}): CanvasAppFeaturePackInstallOptions {
  const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
    assemblyInput,
    featurePackManifests,
  )

  return Object.freeze({
    featurePackStates: snapshotCanvasAppFeaturePackRuntimeStateInputs(
      getCanvasAppResolvedFeaturePackStates(
        featurePackManifests.map((manifest) => manifest.id),
        installOptions,
      ).map((state) => ({
        id: state.id,
        status: state.status,
      })),
    ),
  })
}

function getCanvasAppAssemblyFeaturePackManifests(
  input: CanvasAppFeaturePackAssemblyInput,
): readonly CanvasAppFeaturePackManifest[] {
  const baseFeaturePackManifests =
    input.featurePackManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS
  const additionalFeaturePackManifests =
    input.additionalFeaturePackManifests ?? []

  if (additionalFeaturePackManifests.length === 0) {
    return baseFeaturePackManifests
  }

  return Object.freeze([
    ...baseFeaturePackManifests,
    ...additionalFeaturePackManifests,
  ])
}

function getCanvasAppAssemblyFeaturePackInstallOptions(
  input: CanvasAppFeaturePackAssemblyInput,
  featurePackManifests: readonly CanvasAppFeaturePackManifest[],
): CanvasAppFeaturePackInstallOptions {
  const profile = getCanvasAppAssemblyFeaturePackProfile(input)

  if (!profile) {
    return {
      disabledFeaturePackIds: input.disabledFeaturePackIds,
      featurePackStates: input.featurePackStates,
    }
  }

  return {
    featurePackStates: [
      ...getCanvasAppFeaturePackProfileRuntimeStates({
        featurePackIds: featurePackManifests.map((manifest) => manifest.id),
        profile,
      }),
      ...(input.disabledFeaturePackIds ?? []).map((id) => ({
        id,
        status: 'uninstalled' as const,
      })),
      ...(input.featurePackStates ?? []),
    ],
  }
}

function getCanvasAppAssemblyFeaturePackProfile(
  input: CanvasAppFeaturePackAssemblyInput,
): CanvasAppFeaturePackProfile | undefined {
  if (input.featurePackProfile && input.featurePackProfileId) {
    throw new Error(
      'Canvas app assembly accepts featurePackProfile or featurePackProfileId, not both',
    )
  }

  if (input.featurePackProfile) {
    return input.featurePackProfile
  }

  if (!input.featurePackProfileId) {
    return undefined
  }

  return getCanvasAppFeaturePackProfileById(
    input.featurePackProfiles ?? DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
    input.featurePackProfileId,
  )
}

function snapshotCanvasAppFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
): readonly CanvasAppFeaturePackManifest[] {
  return Object.freeze([...manifests])
}

function snapshotCanvasAppFeaturePackRuntimeStateInputs(
  states: readonly CanvasAppFeaturePackRuntimeStateInput[],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return Object.freeze(states.map((state) =>
    Object.freeze({
      id: state.id,
      status: state.status,
    })
  ))
}

function snapshotCanvasAppFeaturePackMarketplaceListings(
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[],
): readonly CanvasAppFeaturePackMarketplaceListingInput[] {
  return Object.freeze([...listings])
}

function snapshotCanvasAppFeaturePackProfiles(
  profiles: readonly CanvasAppFeaturePackProfile[],
): readonly CanvasAppFeaturePackProfile[] {
  return Object.freeze([...profiles])
}

function snapshotCanvasAppFeaturePackSuiteManifests(
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[],
): readonly CanvasAppFeaturePackSuiteManifest[] {
  return Object.freeze([...suiteManifests])
}

export function snapshotCanvasAppInstalledFeaturePackIds(
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...installedFeaturePackIds])
}

export function snapshotCanvasAppEnabledFeaturePackIds(
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...enabledFeaturePackIds])
}

export function snapshotCanvasAppFeaturePackViewRenderers(
  renderers: CanvasAppFeaturePackViewRenderers,
): CanvasAppFeaturePackViewRenderers {
  assertCanvasAppFeaturePackViewRenderers(renderers)

  return Object.freeze({ ...renderers })
}
