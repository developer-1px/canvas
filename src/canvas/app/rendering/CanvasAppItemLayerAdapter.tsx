import {
  createElement,
} from 'react'
import {
  createCanvasAppPointerInput,
} from '../affordances/interaction/pointer/CanvasAppPointerInput'
import { CanvasDemoSvgItemLayer } from './CanvasDemoSvgItemLayer'
import type {
  CanvasAppItemLayerAdapter,
} from './CanvasAppRenderingContracts'

export type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
  CanvasAppComponentRendererStrategy,
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'

export const DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER: CanvasAppItemLayerAdapter =
  Object.freeze({
    renderItems: (input) =>
      createElement(CanvasDemoSvgItemLayer, {
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
