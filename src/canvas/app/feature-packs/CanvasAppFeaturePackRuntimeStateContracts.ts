import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'

export type CanvasAppFeaturePackInstallOptions = Readonly<{
  disabledFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  featureFlagSettings?: readonly CanvasAppFeatureFlagSettingInput[]
  featurePackStates?: readonly CanvasAppFeaturePackRuntimeStateInput[]
}>

export type CanvasAppFeatureFlagSettingInput = Readonly<{
  enabled: boolean
  id: CanvasAppFeaturePackId
}>

export type CanvasAppFeatureFlagSettings =
  readonly CanvasAppFeatureFlagSettingInput[]

export type CanvasAppFeaturePackRuntimeStatePatchInput = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  options?: CanvasAppFeaturePackInstallOptions
}>

export type CanvasAppFeaturePackRuntimeStatePatch = Readonly<{
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  options: CanvasAppFeaturePackInstallOptions
  stateChanges: readonly CanvasAppFeaturePackRuntimeStatePatchChange[]
}>

export type CanvasAppFeaturePackRuntimeStatePatchChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
}>

export type CanvasAppFeaturePackRuntimeStateStatus =
  | 'activation-failed'
  | 'available'
  | 'disabled'
  | 'enabled'
  | 'installed'
  | 'partially-updated'
  | 'rollback-available'
  | 'uninstalled'
  | 'updating'

export type CanvasAppFeaturePackRuntimeState = Readonly<{
  enabled: boolean
  id: CanvasAppFeaturePackId
  installed: boolean
  status: CanvasAppFeaturePackRuntimeStateStatus
}>

export type CanvasAppFeaturePackRuntimeStateInput = Readonly<{
  enabled?: boolean
  id: CanvasAppFeaturePackId
  installed?: boolean
  status?: CanvasAppFeaturePackRuntimeStateStatus
}>
