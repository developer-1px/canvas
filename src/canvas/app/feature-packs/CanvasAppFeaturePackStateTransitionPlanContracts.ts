import type {
  CanvasAppFeaturePackContributionSurface,
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
  CanvasAppFeaturePackManifestOrphanedDataPolicy,
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeState,
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackInstallPlanBlockedReason,
} from './CanvasAppFeaturePackInstallPlan'
import type {
  CanvasAppFeaturePackPartialUpdatePlanBlockedReason,
} from './CanvasAppFeaturePackPartialUpdatePlan'

export type CanvasAppFeaturePackStateTransitionOperation =
  | 'disable'
  | 'enable'
  | 'install'
  | 'uninstall'

export type CanvasAppFeaturePackStateTransitionPlanStatus =
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackStateTransitionPlanInput = Readonly<{
  manifests: readonly CanvasAppFeaturePackManifest[]
  operation: CanvasAppFeaturePackStateTransitionOperation
  options?: CanvasAppFeaturePackManifestInstallOptions
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackStateTransitionPlan = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  disableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  enableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  installFeaturePackIds: readonly CanvasAppFeaturePackId[]
  operation: CanvasAppFeaturePackStateTransitionOperation
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
  uninstallPolicyEntries:
    readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
  uninstallFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackStateTransitionChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
}>

export type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    orphanedDataScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    orphanedDataPolicy: CanvasAppFeaturePackManifestOrphanedDataPolicy
  }>

export type CanvasAppFeaturePackStateTransitionInstallPlanReason = Readonly<{
  kind: 'install-plan-blocked'
  reason: CanvasAppFeaturePackInstallPlanBlockedReason
}>

export type CanvasAppFeaturePackStateTransitionPartialUpdateReason = Readonly<{
  kind: 'partial-update-blocked'
  reason: CanvasAppFeaturePackPartialUpdatePlanBlockedReason
}>

export type CanvasAppFeaturePackStateTransitionUnknownTargetReason = Readonly<{
  kind: 'unknown-target-pack'
  targetId: CanvasAppFeaturePackId
}>

export type CanvasAppFeaturePackStateTransitionLifecycleReason = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  kind:
    | 'install-unavailable'
    | 'runtime-toggle-unavailable'
    | 'uninstall-unavailable'
}>

export type CanvasAppFeaturePackStateTransitionDependencyReason = Readonly<{
  dependentFeaturePackId: CanvasAppFeaturePackId
  featurePackId: CanvasAppFeaturePackId
  kind: 'required-by-enabled-pack' | 'required-by-installed-pack'
  requiredId: CanvasAppFeaturePackId
}>

export type CanvasAppFeaturePackStateTransitionBlockedReason =
  | CanvasAppFeaturePackStateTransitionDependencyReason
  | CanvasAppFeaturePackStateTransitionInstallPlanReason
  | CanvasAppFeaturePackStateTransitionLifecycleReason
  | CanvasAppFeaturePackStateTransitionPartialUpdateReason
  | CanvasAppFeaturePackStateTransitionUnknownTargetReason

export function isCanvasAppFeaturePackStateTransitionOperation(
  operation: string,
): operation is CanvasAppFeaturePackStateTransitionOperation {
  return (
    operation === 'disable' ||
    operation === 'enable' ||
    operation === 'install' ||
    operation === 'uninstall'
  )
}
