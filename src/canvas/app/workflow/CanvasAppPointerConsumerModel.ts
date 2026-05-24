import type {
  CanvasAppPointerConsumerModel,
  CanvasAppPointerConsumerModelInput,
} from './CanvasAppConsumerContracts'

export function getCanvasAppPointerConsumerModel({
  downHandlers,
  dragHandlers,
}: CanvasAppPointerConsumerModelInput): CanvasAppPointerConsumerModel {
  return {
    itemLayerHandlers: {
      onArrowEndpointPointerDown:
        downHandlers.handleArrowEndpointPointerDown,
      onItemPointerDown: downHandlers.handleItemPointerDown,
      onTextDoubleClick: downHandlers.handleTextDoubleClick,
    },
    stageHandlers: {
      onCanvasPointerDown: downHandlers.handleCanvasPointerDown,
      onPointerCancel: dragHandlers.handlePointerCancel,
      onPointerMove: dragHandlers.handlePointerMove,
      onPointerUp: dragHandlers.handlePointerUp,
      onResizePointerDown: downHandlers.handleResizePointerDown,
    },
  }
}
