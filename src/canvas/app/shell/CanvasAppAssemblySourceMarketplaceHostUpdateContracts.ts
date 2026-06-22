import type {
  CanvasAppAssemblyInput,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult,
  CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult,
} from '../workflow'
import type {
  CanvasAppAssemblyRequiredInputSource,
  CanvasAppAssemblySource,
} from './CanvasAppAssemblySourceContracts'

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateInput<
  TEffect,
  TResult,
> = Readonly<{
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateApplicationSource<
      TEffect,
      TResult
    >
  source?: CanvasAppAssemblySource
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateResult<
  TEffect,
  TResult,
> =
  | CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
    TEffect,
    TResult
  >
  | CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
    TEffect,
    TResult
  >

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateAppliedResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['actionKind']
  applied: true
  application:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >
  assemblyInput: CanvasAppAssemblyInput
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblyRequiredInputSource
  status: 'applied'
  update:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['update']
  updateMode:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateAppliedResult<
      TEffect,
      TResult
    >['updateMode']
}>

export type CanvasAppAssemblySourceFeaturePackMarketplaceHostUpdateHeldResult<
  TEffect,
  TResult,
> = Readonly<{
  actionKind:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['actionKind']
  applied: false
  application:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >
  assemblyInput: CanvasAppAssemblyInput
  holdReason:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['holdReason']
  hostUpdate:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['hostUpdate']
  source: CanvasAppAssemblySource
  status: 'held'
  update: null
  updateMode:
    CanvasAppFeaturePackMarketplaceAssemblyApplyHostUpdateHeldApplicationResult<
      TEffect,
      TResult
    >['updateMode']
}>
