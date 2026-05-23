import {
  createElement,
  type ReactNode,
} from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import {
  createCanvasAppPointerInput,
  type CanvasAppPointerInput,
} from '../pointer/CanvasAppPointerInput'
import { CanvasDemoSvgItemLayer } from './CanvasDemoSvgItemLayer'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'

export type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'

export type CanvasAppItemLayerRenderInput = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (event: CanvasAppPointerInput, itemId: string) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export type CanvasAppItemLayerAdapter = {
  renderItems: (input: CanvasAppItemLayerRenderInput) => ReactNode
}

export const DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER: CanvasAppItemLayerAdapter =
  Object.freeze({
    renderItems: (input) =>
      createElement(CanvasDemoSvgItemLayer, {
        ...input,
        onItemPointerDown: (event, itemId) =>
          input.onItemPointerDown(createCanvasAppPointerInput(event), itemId),
      }),
  })
