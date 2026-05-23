import {
  createElement,
  type PointerEvent,
  type ReactNode,
} from 'react'
import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../../entities'
import { CanvasDemoSvgItemLayer } from './CanvasDemoSvgItemLayer'
import type {
  CanvasDemoSvgComponentPresentationRenderers,
  CanvasDemoSvgComponentRendererStrategy,
} from './CanvasDemoSvgComponentPresentationRegistry'
import type {
  CanvasDemoSvgCustomItemRendererStrategy,
  CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'

export type CanvasAppComponentRendererStrategy =
  CanvasDemoSvgComponentRendererStrategy

export type CanvasAppComponentPresentationRenderers =
  CanvasDemoSvgComponentPresentationRenderers

export type CanvasAppCustomItemRendererStrategy =
  CanvasDemoSvgCustomItemRendererStrategy

export type CanvasAppCustomItemRenderers = CanvasDemoSvgCustomItemRenderers

export type CanvasAppItemLayerRenderInput = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: (component: string) => string
  items: CanvasItem[]
  outlineIds: Set<string>
  selected: Set<string>
  onItemPointerDown: (
    event: PointerEvent<SVGGElement>,
    itemId: string,
  ) => void
  onTextDoubleClick: (item: RectItem | TextItem) => void
}

export type CanvasAppItemLayerAdapter = {
  renderItems: (input: CanvasAppItemLayerRenderInput) => ReactNode
}

export const DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER: CanvasAppItemLayerAdapter =
  Object.freeze({
    renderItems: (input) => createElement(CanvasDemoSvgItemLayer, input),
  })
