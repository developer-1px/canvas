import type {
  CanvasInteractionKind,
  CanvasItem,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasOverlayState } from '../../engine'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type {
  CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppStageAdapter,
  CanvasAppStageMount,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppPointerConsumerModel } from './CanvasAppPointerConsumerContracts'

export type CanvasAppStageItemLayerContext = {
  items: CanvasItem[]
  selected: Set<string>
}

export type CanvasAppStageRenderingContext = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppStageContext = {
  activeMode: Tool
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
}

export type CanvasAppStageModelInput = {
  blurTextEditor: () => void
  itemLayer: CanvasAppStageItemLayerContext
  pointer: CanvasAppPointerConsumerModel
  rendering: CanvasAppStageRenderingContext
  stage: CanvasAppStageContext
}
