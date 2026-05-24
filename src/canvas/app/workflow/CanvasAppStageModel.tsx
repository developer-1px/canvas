import type { ReactNode } from 'react'
import type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
  CanvasAppStageAdapter,
  CanvasAppStageRenderInput,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppEventInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppStageModelInput } from './CanvasAppConsumerContracts'

export type { CanvasAppStageModelInput } from './CanvasAppConsumerContracts'

export function renderCanvasAppStageModel({
  blurTextEditor,
  cursorChat,
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
      onArrowEndpointPointerDown: (event, itemId, endpoint) => {
        cursorChat.onPointerDown(event)
        blurTextEditor()
        pointer.itemLayerHandlers.onArrowEndpointPointerDown(
          event,
          itemId,
          endpoint,
        )
      },
      onTextDoubleClick: pointer.itemLayerHandlers.onTextDoubleClick,
      onItemPointerDown: (event, itemId) => {
        cursorChat.onPointerDown(event)
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
        cursorChat.onPointerDown(event)
        blurTextEditor()
        pointer.stageHandlers.onCanvasPointerDown(event)
      },
      onContextMenu: preventCanvasContextMenu,
      onPointerCancel: pointer.stageHandlers.onPointerCancel,
      onPointerMove: (event) => {
        cursorChat.onPointerMove(event)
        pointer.stageHandlers.onPointerMove(event)
      },
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
