import type { CanvasOverlayState } from '../../engine'
import type {
  CanvasInteractionKind,
  CanvasItem,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
  CanvasAppStageMount,
} from '../rendering/CanvasAppRenderingContracts'
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
  cursorChat: CanvasAppStageCursorChatContext
  emote: CanvasAppStageEmoteContext
  itemLayer: CanvasAppStageItemLayerContext
  pointer: CanvasAppPointerConsumerModel
  rendering: CanvasAppStageRenderingContext
  stage: CanvasAppStageContext
}

export type CanvasAppStageCursorChatContext = {
  onPointerDown: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
}

export type CanvasAppStageEmoteContext = {
  onPointerDown: (event: CanvasAppPointerInput) => boolean
  onPointerMove: (event: CanvasAppPointerInput) => void
}
