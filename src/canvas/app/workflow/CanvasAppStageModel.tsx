import type { ReactNode } from 'react'
import type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
  CanvasAppStageAdapter,
  CanvasAppStageRenderInput,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppEventInput } from '../affordances/interaction/pointer/CanvasAppPointerInput'
import { CanvasInlineTextEditingContext } from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'
import type { CanvasAppStageModelInput } from './CanvasAppStageConsumerContracts'

export type { CanvasAppStageModelInput } from './CanvasAppStageConsumerContracts'

export function renderCanvasAppStageModel({
  blurTextEditor,
  cursorChat,
  emote,
  inlineTextEditor,
  itemLayer,
  pointer,
  rendering,
  stage,
}: CanvasAppStageModelInput) {
  const itemLayerChildren = renderCanvasAppItemLayerSafely({
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
  const children = itemLayerChildren === null
    ? null
    : (
      <CanvasInlineTextEditingContext.Provider value={inlineTextEditor}>
        {itemLayerChildren}
      </CanvasInlineTextEditingContext.Provider>
    )

  return renderCanvasAppStageSafely({
    adapter: rendering.stageAdapter,
    input: {
      ...stage,
      children,
      onCanvasPointerDown: (event) => {
        cursorChat.onPointerDown(event)
        if (emote.onPointerDown(event)) {
          blurTextEditor()
          return
        }

        blurTextEditor()
        pointer.stageHandlers.onCanvasPointerDown(event)
      },
      onContextMenu: preventCanvasContextMenu,
      onPointerCancel: pointer.stageHandlers.onPointerCancel,
      onPointerMove: (event) => {
        cursorChat.onPointerMove(event)
        emote.onPointerMove(event)
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
