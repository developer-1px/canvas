import type {
  ResizeHandle,
} from '../../entities'
import type { CanvasEditableTextItem } from '../../host'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'

export type CanvasAppPointerItemLayerHandlers = {
  onItemPointerDown: (
    event: CanvasAppPointerInput,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: CanvasEditableTextItem) => void
}

export type CanvasAppPointerStageHandlers = {
  onCanvasPointerDown: (event: CanvasAppPointerInput) => void
  onPointerCancel: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
  onPointerUp: (event: CanvasAppPointerInput) => void
  onResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppPointerConsumerModel = {
  itemLayerHandlers: CanvasAppPointerItemLayerHandlers
  stageHandlers: CanvasAppPointerStageHandlers
}
