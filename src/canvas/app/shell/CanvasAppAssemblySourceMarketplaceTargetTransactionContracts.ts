import type {
  CanvasAppFeaturePackMarketplaceSelectionControlModel,
  CanvasAppFeaturePackMarketplaceTarget,
  CanvasAppFeaturePackMarketplaceTargetControl,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult,
  CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput,
} from '../workflow'
import type { CanvasAppAssemblySource } from './CanvasAppAssemblySourceContracts'
import type {
  CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult,
  CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult,
} from './CanvasAppAssemblySourceMarketplaceHostUpdateContracts'

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
  TEffect,
  TResult,
> = CanvasAppFeaturePackMarketplaceAssemblyTargetApplyTransactionInput<
  TEffect,
  TResult
> & Readonly<{
  source?: CanvasAppAssemblySource
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionInput<
    TEffect,
    TResult
  >,
  'target'
> & Readonly<{
  control: CanvasAppFeaturePackMarketplaceTargetControl
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionMissingResult =
  Readonly<{
    actionKind: null
    applied: false
    control: CanvasAppFeaturePackMarketplaceTargetControl
    holdReason: 'missing-target'
    hostUpdate: null
    source: CanvasAppAssemblySource
    sourceResult: null
    status: 'missing'
    target: CanvasAppFeaturePackMarketplaceTargetControl['target']
    transactionResult: null
    update: null
    updateMode: 'blocked'
  }>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionInput<
  TEffect,
  TResult,
> = Omit<
  CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionInput<
    TEffect,
    TResult
  >,
  'control'
> & Readonly<{
  selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
  target: CanvasAppFeaturePackMarketplaceTarget
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransactionResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult

export type CanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransactionMissingResult =
  Readonly<{
    actionKind: null
    applied: false
    control: null
    holdReason: 'missing-selection-target'
    hostUpdate: null
    selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
    source: CanvasAppAssemblySource
    sourceResult: null
    status: 'missing-selection-target'
    target: CanvasAppFeaturePackMarketplaceTarget
    transactionResult: null
    update: null
    updateMode: 'blocked'
  }>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['actionKind']
  applied: true
  hostUpdate:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['hostUpdate']
  source:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['source']
  sourceResult:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >
  status: 'applied'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
      TEffect,
      TResult
    >
  update:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['update']
  updateMode:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
      TEffect,
      TResult
    >['updateMode']
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransactionHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['actionKind']
  applied: false
  holdReason:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['holdReason']
  hostUpdate:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblySource
  sourceResult:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >
  status: 'held'
  transactionResult:
    CanvasAppFeaturePackMarketplaceAssemblyApplyTransactionResult<
      TEffect,
      TResult
    >
  update: null
  updateMode:
    CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
      TEffect,
      TResult
    >['updateMode']
}>
