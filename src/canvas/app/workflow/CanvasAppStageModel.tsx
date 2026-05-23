import type { ReactNode } from 'react'
import type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppStageAdapter,
  CanvasAppStageRenderInput,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppEventInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppStageModelInput } from './CanvasAppStageConsumerContracts'

export type { CanvasAppStageModelInput } from './CanvasAppStageConsumerContracts'

export function renderCanvasAppStageModel({
  blurTextEditor,
  itemLayer,
  pointer,
  rendering,
  stage,
}: CanvasAppStageModelInput) {
  const children = renderCanvasAppItemLayerSafely({
    adapter: rendering.itemLayerAdapter,
    input: {
      componentPresentationRenderers:
        rendering.componentPresentationRenderers,
      customItemRenderers: rendering.customItemRenderers,
      getComponentPresentation: rendering.getComponentPresentation,
      items: itemLayer.items,
      outlineIds: stage.overlays.itemOutlineIds,
      selected: itemLayer.selected,
      onTextDoubleClick: pointer.itemLayerHandlers.onTextDoubleClick,
      onItemPointerDown: (event, itemId) => {
        blurTextEditor()
        pointer.itemLayerHandlers.onItemPointerDown(event, itemId)
      },
    },
  })

  return renderCanvasAppStageSafely({
    adapter: rendering.stageAdapter,
    input: {
      ...stage,
      children,
      onCanvasPointerDown: (event) => {
        blurTextEditor()
        pointer.stageHandlers.onCanvasPointerDown(event)
      },
      onContextMenu: preventCanvasContextMenu,
      onPointerCancel: pointer.stageHandlers.onPointerCancel,
      onPointerMove: pointer.stageHandlers.onPointerMove,
      onPointerUp: pointer.stageHandlers.onPointerUp,
      onResizePointerDown: pointer.stageHandlers.onResizePointerDown,
    },
  })
}

function renderCanvasAppItemLayerSafely({
  adapter,
  input,
}: {
  adapter: CanvasAppItemLayerAdapter
  input: CanvasAppItemLayerRenderInput
}): ReactNode {
  try {
    return adapter.renderItems(input)
  } catch {
    return null
  }
}

function renderCanvasAppStageSafely({
  adapter,
  input,
}: {
  adapter: CanvasAppStageAdapter
  input: CanvasAppStageRenderInput
}): ReactNode {
  try {
    return adapter.renderStage(input)
  } catch {
    return null
  }
}

function preventCanvasContextMenu(event: CanvasAppEventInput) {
  event.preventDefault()
}
