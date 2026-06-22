import type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanupContracts'
import {
  getCanvasAppFeaturePackMarketplaceUninstallCleanupFeaturePackIdsByScopeId,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanupScopes'

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
