import {
  createElement,
} from 'react'
import {
  createCanvasAppPointerInput,
} from '../affordances/interaction/pointer/CanvasAppPointerInput'
import { CanvasWhiteboardSvgItemLayer } from './CanvasWhiteboardSvgItemLayer'
import type {
  CanvasAppItemLayerAdapter,
} from './CanvasAppRenderingContracts'

export type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
  CanvasAppComponentRendererStrategy,
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderKey,
  CanvasAppCustomItemRenderKeyStrategy,
  CanvasAppCustomItemRendererDescriptor,
  CanvasAppCustomItemRendererEntry,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'

export const DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER: CanvasAppItemLayerAdapter =
  Object.freeze({
    renderItems: (input) =>
      createElement(CanvasWhiteboardSvgItemLayer, {
        ...input,
        onArrowEndpointPointerDown: (event, itemId, endpoint) =>
          input.onArrowEndpointPointerDown(
            createCanvasAppPointerInput(event),
            itemId,
            endpoint,
          ),
        onItemPointerDown: (event, itemId) =>
          input.onItemPointerDown(createCanvasAppPointerInput(event), itemId),
      }),
  })
