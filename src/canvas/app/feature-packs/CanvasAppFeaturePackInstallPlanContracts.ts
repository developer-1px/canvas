import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackInstallPlanMode =
  | 'enable'
  | 'install'

export type CanvasAppFeaturePackInstallPlanStatus =
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackInstallPlanInput = Readonly<{
  manifests: readonly CanvasAppFeaturePackManifest[]
  mode?: CanvasAppFeaturePackInstallPlanMode
  options?: CanvasAppFeaturePackManifestInstallOptions
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackInstallPlan = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackInstallPlanBlockedReason[]
  enableFeaturePackIds: readonly CanvasAppFeaturePackId[]
  includedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installFeaturePackIds: readonly CanvasAppFeaturePackId[]
  mode: CanvasAppFeaturePackInstallPlanMode
  ready: boolean
  status: CanvasAppFeaturePackInstallPlanStatus
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackInstallPlanConflictScope =
  | 'enabled'
  | 'installed'

export type CanvasAppFeaturePackInstallPlanMissingRequiredReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'missing-required-pack'
    requiredId: CanvasAppFeaturePackId
  }>

export type CanvasAppFeaturePackInstallPlanUnknownTargetReason =
  Readonly<{
    kind: 'unknown-target-pack'
    targetId: CanvasAppFeaturePackId
  }>

export type CanvasAppFeaturePackInstallPlanConflictReason =
  Readonly<{
    conflictId: CanvasAppFeaturePackId
    featurePackId: CanvasAppFeaturePackId
    kind: 'enabled-conflict' | 'installed-conflict'
    scope: CanvasAppFeaturePackInstallPlanConflictScope
  }>

export type CanvasAppFeaturePackInstallPlanBlockedReason =
  | CanvasAppFeaturePackInstallPlanConflictReason
  | CanvasAppFeaturePackInstallPlanMissingRequiredReason
  | CanvasAppFeaturePackInstallPlanUnknownTargetReason
