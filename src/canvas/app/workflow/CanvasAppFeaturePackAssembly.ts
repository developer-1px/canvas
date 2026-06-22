import {
  createCanvasAppFeaturePackExtensionBundle,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
  assertCanvasAppFeaturePackViewRenderers,
  createCanvasAppFeaturePackViewRenderers,
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppManifestExtensionFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
  getCanvasAppInstalledFeaturePackManifestIds,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppViewFeaturePack,
} from '../feature-packs'
import type {
  CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  getCanvasAppAssemblyFeaturePackInstallOptions,
  getCanvasAppAssemblyFeaturePackManifests,
  snapshotCanvasAppFeaturePackViewRenderers,
} from './CanvasAppFeaturePackAssemblyInputs'
export {
  createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyExecution'
export {
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceAssemblyItemApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyTransactions'
export {
  getCanvasAppFeaturePackMarketplaceActionAssemblyInput,
  getCanvasAppFeaturePackMarketplaceActionAssemblyPlan,
} from './CanvasAppFeaturePackMarketplaceActionAssemblyPlans'
export type {
  CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan,
  CanvasAppFeaturePackMarketplaceActionAssemblyInput,
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan,
} from './CanvasAppFeaturePackMarketplaceActionAssemblyPlans'
export {
  getCanvasAppFeaturePackMarketplaceAssemblyItemAction,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetAction,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetItem,
} from './CanvasAppFeaturePackMarketplaceAssemblyActionAdapters'
export type {
  CanvasAppFeaturePackMarketplaceAssemblyActionInput,
  CanvasAppFeaturePackMarketplaceAssemblyItemInput,
  CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyActionAdapters'
export {
  getCanvasAppFeaturePackMarketplaceAssemblyActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
export type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
export type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCleanupFailedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitHoldPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlanStatus,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResultStatus,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCompletedExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummary,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionCleanupSummaryStatus,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlanStatus,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionResultStatus,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  CanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummaryInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyNeedsCleanupHandlerExecutionResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyCommitPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyExecutionPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  CanvasAppFeaturePackMarketplaceAssemblyItemApplyTransactionInput,
  CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyContracts'
export {
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
export type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
  CanvasAppFeaturePackMarketplaceAssemblyModelInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
export {
  applyCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdate,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch,
} from './CanvasAppFeaturePackMarketplaceAssemblyHostUpdates'
export {
  snapshotCanvasAppEnabledFeaturePackIds,
  snapshotCanvasAppFeaturePackViewRenderers,
  snapshotCanvasAppInstalledFeaturePackIds,
} from './CanvasAppFeaturePackAssemblyInputs'
export type {
  CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan'
export {
  createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'
export type {
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffect,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectExecutor,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectFailedExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectInput,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionInput,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanExecutionStatus,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanInput,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlanStatus,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSkippedExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupEffectSucceededExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupExecutionResult,
  CanvasAppFeaturePackMarketplaceUninstallCleanupScopeHandler,
} from './CanvasAppFeaturePackMarketplaceUninstallCleanup'

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
  featureFlagSettings?: CanvasAppFeaturePackInstallOptions[
    'featureFlagSettings'
  ]
  featurePackStates?: CanvasAppFeaturePackInstallOptions['featurePackStates']
  featurePackManifests?: readonly CanvasAppFeaturePackManifest[]
  featurePackProfile?: CanvasAppFeaturePackProfile
  featurePackProfileId?: CanvasAppFeaturePackProfileId
  featurePackProfiles?: readonly CanvasAppFeaturePackProfile[]
  featurePackViewRenderers?: CanvasAppFeaturePackViewRenderers
  viewFeaturePacks?: readonly CanvasAppViewFeaturePack[]
}

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
    input.featureFlagSettings ||
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
