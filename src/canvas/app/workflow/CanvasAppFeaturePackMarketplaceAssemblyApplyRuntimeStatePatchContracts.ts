import type {
  CanvasAppFeaturePackMarketplacePrimaryAction,
  CanvasAppFeaturePackRuntimeStatePatch,
  CanvasAppFeaturePackRuntimeStateInput,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyCommitContracts'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchInput<
  TEffect,
  TResult,
> = Readonly<{
  commitResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult<TEffect, TResult>
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  commitResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyCommittedResult<TEffect, TResult>
  currentFeaturePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  nextFeaturePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  patch: CanvasAppFeaturePackRuntimeStatePatch
  patched: true
  status: 'patched'
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  commitResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
      TEffect,
      TResult
    >
  currentFeaturePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
      TEffect,
      TResult
    >['holdReason']
  patch: null
  patched: false
  status: 'held'
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>
