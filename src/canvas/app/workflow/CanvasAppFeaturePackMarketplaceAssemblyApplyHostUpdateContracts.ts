import type {
  CanvasAppFeaturePackMarketplacePrimaryAction,
  CanvasAppFeaturePackRuntimeStatePatch,
  CanvasAppFeaturePackRuntimeStateInput,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyCommitContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionContracts'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchContracts'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateInput<
  TEffect,
  TResult,
> = Readonly<{
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
      TEffect,
      TResult
    >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationInput<
  TEffect,
  TResult,
> = Readonly<{
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource<
      TEffect,
      TResult
    >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  applied: true
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  currentAssemblyInput: CanvasAppFeaturePackAssemblyInput
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationReadySource<
      TEffect,
      TResult
    >
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  status: 'applied'
  update: CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  applied: false
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  currentAssemblyInput: CanvasAppFeaturePackAssemblyInput
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
      TEffect,
      TResult
    >['holdReason']
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationHeldSource<
      TEffect,
      TResult
    >
  status: 'held'
  update: null
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateResult<
  TEffect,
  TResult,
> =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult<
    TEffect,
    TResult
  >
  | CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateReadyResult<
  TEffect,
  TResult,
> = Omit<
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult<
    TEffect,
    TResult
  >,
  'transactionResult'
>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionHostUpdateHeldResult<
  TEffect,
  TResult,
> = Omit<
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult<
    TEffect,
    TResult
  >,
  'transactionResult'
>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate =
  Readonly<{
    assemblyInput: CanvasAppFeaturePackAssemblyInput
    featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
    kind: 'replace-assembly-input'
    runtimeStatePatch: CanvasAppFeaturePackRuntimeStatePatch
    updateMode: Exclude<
      CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
      'blocked'
    >
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateReadyResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  currentAssemblyInput: CanvasAppFeaturePackAssemblyInput
  nextAssemblyInput: CanvasAppFeaturePackAssemblyInput
  ready: true
  runtimeStatePatch:
    CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchAppliedResult<
      TEffect,
      TResult
    >
  status: 'ready'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
      TEffect,
      TResult
    >
  update:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostAssemblyInputUpdate
  updateMode: Exclude<
    CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
    'blocked'
  >
}>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
  currentAssemblyInput: CanvasAppFeaturePackAssemblyInput
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHeldCommitResult<
      TEffect,
      TResult
    >['holdReason']
  ready: false
  runtimeStatePatch:
    CanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatchHeldResult<
      TEffect,
      TResult
    >
  status: 'held'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionBaseResult<
      TEffect,
      TResult
    >
  update: null
  updateMode: CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode
}>
