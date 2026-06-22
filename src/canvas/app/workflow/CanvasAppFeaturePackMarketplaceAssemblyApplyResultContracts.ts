import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan,
  CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyApplyPlans'

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
