import type {
  ResizeHandle,
} from '../../entities'
import type { CanvasEditableTextItem } from '../../host'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import type { CanvasAppPointerConsumerModel } from './CanvasAppConsumerContracts'

type CanvasAppPointerDownRuntime = {
  handleCanvasPointerDown: (event: CanvasAppPointerInput) => void
  handleItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  handleResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
  handleTextDoubleClick: (item: CanvasEditableTextItem) => void
}

type CanvasAppPointerDragRuntime = {
  handlePointerCancel: (event: CanvasAppPointerInput) => void
  handlePointerMove: (event: CanvasAppPointerInput) => void
  handlePointerUp: (event: CanvasAppPointerInput) => void
}

type GetCanvasAppPointerConsumerModelArgs = {
  downHandlers: CanvasAppPointerDownRuntime
  dragHandlers: CanvasAppPointerDragRuntime
}

export function getCanvasAppPointerConsumerModel({
  downHandlers,
  dragHandlers,
}: GetCanvasAppPointerConsumerModelArgs): CanvasAppPointerConsumerModel {
  return {
    itemLayerHandlers: {
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
